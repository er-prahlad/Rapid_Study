package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.model.*
import com.rapidstudy.data.remote.ApiService
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

/**
 * Phase 51: Android Test Engine ViewModel
 *
 * SECURITY RULES (backend jaisa):
 * 1. expiresAt server se aata hai — client sirf display karta hai
 * 2. Correct answers kabhi save nahi hote active test mein
 * 3. Score calculation server pe hoti hai
 * 4. Duplicate submit blocked
 */
class TestViewModel(private val apiService: ApiService) : ViewModel() {

    // ── State ─────────────────────────────────────────────────────────

    private val _startState  = MutableStateFlow<UiState<StartAttemptResponse>?>(null)
    val startState: StateFlow<UiState<StartAttemptResponse>?> = _startState

    private val _submitState = MutableStateFlow<UiState<SubmitResponse>?>(null)
    val submitState: StateFlow<UiState<SubmitResponse>?> = _submitState

    // Questions list
    private val _questions   = MutableStateFlow<List<QuestionSafeDto>>(emptyList())
    val questions: StateFlow<List<QuestionSafeDto>> = _questions

    // Current question index
    private val _currentIndex = MutableStateFlow(0)
    val currentIndex: StateFlow<Int> = _currentIndex

    // Per-question: selectedOptionId + markedForReview
    private val _answers = MutableStateFlow<Map<Long, Long?>>(emptyMap())  // questionId → optionId
    val answers: StateFlow<Map<Long, Long?>> = _answers

    private val _reviewed = MutableStateFlow<Set<Long>>(emptySet())   // questionId set
    val reviewed: StateFlow<Set<Long>> = _reviewed

    private val _visited  = MutableStateFlow<Set<Long>>(emptySet())
    val visited:  StateFlow<Set<Long>> = _visited

    // Server timer — expiresAt ISO string from backend
    private val _expiresAt     = MutableStateFlow<String?>(null)
    val expiresAt: StateFlow<String?> = _expiresAt

    // Countdown in seconds (computed client-side from server's expiresAt)
    private val _secondsLeft   = MutableStateFlow(0L)
    val secondsLeft: StateFlow<Long> = _secondsLeft

    private val _attemptId     = MutableStateFlow<Long?>(null)
    val attemptId: StateFlow<Long?> = _attemptId

    private val _testTitle     = MutableStateFlow("")
    val testTitle: StateFlow<String> = _testTitle

    private var timerJob: Job? = null
    private var alreadySubmitted = false

    // ── Start Attempt ─────────────────────────────────────────────────

    fun startAttempt(testId: Long) {
        viewModelScope.launch {
            _startState.value = UiState.Loading
            try {
                val resp = apiService.startAttempt(testId)
                if (resp.isSuccessful && resp.body()?.data != null) {
                    val data = resp.body()!!.data!!
                    _attemptId.value   = data.attemptId
                    _testTitle.value   = data.testTitle
                    _questions.value   = data.questions
                    _expiresAt.value   = data.expiresAt
                    _currentIndex.value = 0
                    alreadySubmitted   = false

                    // Pehla question visited mark karo
                    data.questions.firstOrNull()?.let { markVisited(it.id) }

                    // Server timer start karo (Phase 24 jaisa)
                    startServerTimer(data.expiresAt)
                    _startState.value = UiState.Success(data)
                } else {
                    _startState.value = UiState.Error(resp.body()?.message ?: "Test start nahi hua")
                }
            } catch (e: Exception) {
                _startState.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }

    // ── Server-Authoritative Timer (Phase 24) ─────────────────────────

    private fun startServerTimer(expiresAtIso: String) {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (true) {
                val remaining = computeSecondsRemaining(expiresAtIso)
                _secondsLeft.value = remaining
                if (remaining <= 0) {
                    // Time khatam — auto submit
                    if (!alreadySubmitted) submitAttempt()
                    break
                }
                delay(1000L)
            }
        }
    }

    private fun computeSecondsRemaining(expiresAtIso: String): Long {
        return try {
            val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
            fmt.timeZone = java.util.TimeZone.getTimeZone("UTC")
            val expiry = fmt.parse(expiresAtIso.substringBefore("."))?.time ?: return 0L
            val now    = System.currentTimeMillis()
            val diff   = (expiry - now) / 1000L
            maxOf(0L, diff)
        } catch (e: Exception) { 0L }
    }

    fun formatTimer(seconds: Long): String {
        val h = seconds / 3600
        val m = (seconds % 3600) / 60
        val s = seconds % 60
        return if (h > 0) String.format("%d:%02d:%02d", h, m, s)
        else              String.format("%02d:%02d", m, s)
    }

    // ── Navigation ────────────────────────────────────────────────────

    fun goToQuestion(index: Int) {
        val q = _questions.value.getOrNull(index) ?: return
        _currentIndex.value = index
        markVisited(q.id)
    }

    fun nextQuestion() { goToQuestion((_currentIndex.value + 1).coerceAtMost(_questions.value.size - 1)) }
    fun prevQuestion() { goToQuestion((_currentIndex.value - 1).coerceAtLeast(0)) }

    private fun markVisited(questionId: Long) {
        _visited.value = _visited.value + questionId
    }

    // ── Save Answer (Phase 26) ─────────────────────────────────────────

    fun selectOption(questionId: Long, optionId: Long) {
        // Immediate UI update (optimistic)
        _answers.value = _answers.value + (questionId to optionId)

        // Backend ko bhi bhejna — fire and forget
        viewModelScope.launch {
            try {
                val aId = _attemptId.value ?: return@launch
                apiService.saveAnswer(aId, questionId, SaveAnswerRequest(optionId))
            } catch (e: Exception) {
                // Log karo, UI already updated hai
            }
        }
    }

    // ── Clear Answer (Phase 27) ───────────────────────────────────────

    fun clearAnswer(questionId: Long) {
        _answers.value = _answers.value + (questionId to null)
        viewModelScope.launch {
            try {
                val aId = _attemptId.value ?: return@launch
                apiService.clearAnswer(aId, questionId)
            } catch (e: Exception) {}
        }
    }

    // ── Mark for Review (Phase 27) ────────────────────────────────────

    fun toggleReview(questionId: Long) {
        val isMarked = questionId in _reviewed.value
        _reviewed.value = if (isMarked) _reviewed.value - questionId
                          else          _reviewed.value + questionId

        viewModelScope.launch {
            try {
                val aId = _attemptId.value ?: return@launch
                if (!isMarked) apiService.markForReview(aId, questionId)
                else           apiService.clearAnswer(aId, questionId) // unmark endpoint
            } catch (e: Exception) {}
        }
    }

    // ── Submit (Phase 28) ─────────────────────────────────────────────

    fun submitAttempt() {
        if (alreadySubmitted) return
        val aId = _attemptId.value ?: return

        viewModelScope.launch {
            alreadySubmitted = true
            timerJob?.cancel()
            _submitState.value = UiState.Loading
            try {
                val resp = apiService.submitAttempt(aId)
                if (resp.isSuccessful && resp.body()?.data != null) {
                    _submitState.value = UiState.Success(resp.body()!!.data!!)
                } else {
                    _submitState.value = UiState.Error("Submit nahi hua")
                }
            } catch (e: Exception) {
                _submitState.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }

    // ── Question State (palette ke liye) ─────────────────────────────

    enum class QState { NOT_VISITED, VISITED, ANSWERED, MARKED_FOR_REVIEW, ANSWERED_AND_MARKED }

    fun getQuestionState(questionId: Long): QState {
        val answered = _answers.value[questionId] != null
        val flagged  = questionId in _reviewed.value
        val seen     = questionId in _visited.value
        return when {
            answered && flagged -> QState.ANSWERED_AND_MARKED
            answered            -> QState.ANSWERED
            flagged             -> QState.MARKED_FOR_REVIEW
            seen                -> QState.VISITED
            else                -> QState.NOT_VISITED
        }
    }

    override fun onCleared() {
        super.onCleared()
        timerJob?.cancel()
    }
}
