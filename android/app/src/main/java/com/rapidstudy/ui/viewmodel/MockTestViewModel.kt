package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.model.Exam
import com.rapidstudy.data.model.MockTest
import com.rapidstudy.data.remote.ApiService
import com.rapidstudy.data.remote.PageResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MockTestViewModel(private val api: ApiService) : ViewModel() {

    private val _tests  = MutableStateFlow<UiState<PageResponse<MockTest>>>(UiState.Loading)
    val tests: StateFlow<UiState<PageResponse<MockTest>>> = _tests

    private val _exams  = MutableStateFlow<List<Exam>>(emptyList())
    val exams: StateFlow<List<Exam>> = _exams

    private var selectedExamId: Long? = null
    private var currentPage = 0

    init { loadExams(); loadTests() }

    fun loadExams() = viewModelScope.launch {
        try {
            val r = api.getExams(size = 50)
            if (r.isSuccessful) _exams.value = r.body()?.data?.content ?: emptyList()
        } catch (_: Exception) {}
    }

    fun loadTests(examId: Long? = selectedExamId, page: Int = 0) {
        selectedExamId = examId
        currentPage    = page
        viewModelScope.launch {
            _tests.value = UiState.Loading
            try {
                val r = api.getTests(examId = examId, page = page, size = 20)
                if (r.isSuccessful && r.body()?.data != null) {
                    _tests.value = UiState.Success(r.body()!!.data!!)
                } else {
                    _tests.value = UiState.Error("Tests load nahi hue")
                }
            } catch (e: Exception) {
                _tests.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun nextPage() { if (currentPage >= 0) loadTests(page = currentPage + 1) }
    fun prevPage() { if (currentPage > 0)  loadTests(page = currentPage - 1) }
}
