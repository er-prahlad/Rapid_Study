package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.model.QuestionSafeDto
import com.rapidstudy.data.remote.ApiService
import com.rapidstudy.data.remote.PageResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class PracticeViewModel(private val api: ApiService) : ViewModel() {

    private val _questions = MutableStateFlow<UiState<PageResponse<QuestionSafeDto>>>(UiState.Loading)
    val questions: StateFlow<UiState<PageResponse<QuestionSafeDto>>> = _questions

    // Answered map: questionId -> optionId
    private val _answers   = MutableStateFlow<Map<Long, Long>>(emptyMap())
    val answers: StateFlow<Map<Long, Long>> = _answers

    // Revealed questions (answer shown)
    private val _revealed  = MutableStateFlow<Set<Long>>(emptySet())
    val revealed: StateFlow<Set<Long>> = _revealed

    // Bookmarked question ids
    private val _bookmarked = MutableStateFlow<Set<Long>>(emptySet())
    val bookmarked: StateFlow<Set<Long>> = _bookmarked

    var difficulty: String? = null
    var currentPage = 0

    init { load() }

    fun load(diff: String? = difficulty, page: Int = 0) {
        difficulty  = diff
        currentPage = page
        viewModelScope.launch {
            _questions.value = UiState.Loading
            try {
                val r = api.getPracticeQuestions(difficulty = diff, page = page, size = 10)
                if (r.isSuccessful && r.body()?.data != null) {
                    _questions.value = UiState.Success(r.body()!!.data!!)
                } else {
                    _questions.value = UiState.Error("Questions load nahi hue")
                }
            } catch (e: Exception) {
                _questions.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun selectOption(questionId: Long, optionId: Long) {
        _answers.value = _answers.value + (questionId to optionId)
    }

    fun revealAnswer(questionId: Long) {
        _revealed.value = _revealed.value + questionId
    }

    fun toggleBookmark(questionId: Long) = viewModelScope.launch {
        val isMarked = questionId in _bookmarked.value
        try {
            if (isMarked) {
                api.removeBookmark(questionId)
                _bookmarked.value = _bookmarked.value - questionId
            } else {
                api.addBookmark(questionId)
                _bookmarked.value = _bookmarked.value + questionId
            }
        } catch (_: Exception) {}
    }

    fun nextPage() { load(page = currentPage + 1) }
    fun prevPage() { if (currentPage > 0) load(page = currentPage - 1) }
}
