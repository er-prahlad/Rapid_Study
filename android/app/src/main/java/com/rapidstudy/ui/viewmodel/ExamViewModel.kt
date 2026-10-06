package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.model.Exam
import com.rapidstudy.data.remote.ApiService
import com.rapidstudy.data.remote.PageResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ExamViewModel(private val api: ApiService) : ViewModel() {

    private val _exams = MutableStateFlow<UiState<PageResponse<Exam>>>(UiState.Loading)
    val exams: StateFlow<UiState<PageResponse<Exam>>> = _exams

    private var searchQuery = ""
    private var currentPage = 0

    init { load() }

    fun load(query: String = searchQuery, page: Int = 0) {
        searchQuery  = query
        currentPage  = page
        viewModelScope.launch {
            _exams.value = UiState.Loading
            try {
                val r = api.getExams(search = query.ifBlank { null }, page = page, size = 20)
                if (r.isSuccessful && r.body()?.data != null) {
                    _exams.value = UiState.Success(r.body()!!.data!!)
                } else {
                    _exams.value = UiState.Error("Exams load nahi hue")
                }
            } catch (e: Exception) {
                _exams.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }
}
