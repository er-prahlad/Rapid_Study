package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.model.DashboardResponse
import com.rapidstudy.data.remote.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

class HomeViewModel(private val apiService: ApiService) : ViewModel() {

    private val _dashboard = MutableStateFlow<UiState<DashboardResponse>>(UiState.Loading)
    val dashboard: StateFlow<UiState<DashboardResponse>> = _dashboard

    init { loadDashboard() }

    fun loadDashboard() {
        viewModelScope.launch {
            _dashboard.value = UiState.Loading
            try {
                val response = apiService.getDashboard()
                if (response.isSuccessful && response.body()?.data != null) {
                    _dashboard.value = UiState.Success(response.body()!!.data!!)
                } else {
                    _dashboard.value = UiState.Error("Dashboard load nahi hua")
                }
            } catch (e: Exception) {
                _dashboard.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }
}
