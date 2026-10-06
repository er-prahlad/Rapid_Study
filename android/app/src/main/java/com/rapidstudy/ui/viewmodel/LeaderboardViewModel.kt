package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.remote.ApiService
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class LeaderboardEntry(
    val rank: Int, val userId: Long, val name: String,
    val profileImage: String?, val averageScore: Double,
    val accuracy: Double, val testsCompleted: Int, val isCurrentUser: Boolean
)

data class LeaderboardResponse(val entries: List<LeaderboardEntry>, val currentUserRank: Int?)

class LeaderboardViewModel(private val api: ApiService) : ViewModel() {

    private val _data = MutableStateFlow<UiState<LeaderboardResponse>>(UiState.Loading)
    val data: StateFlow<UiState<LeaderboardResponse>> = _data

    var selectedPeriod = "ALL_TIME"

    init { load() }

    fun load(period: String = selectedPeriod) {
        selectedPeriod = period
        viewModelScope.launch {
            _data.value = UiState.Loading
            try {
                val r = api.getLeaderboard(period = period)
                if (r.isSuccessful && r.body()?.data != null) {
                    // Parse the Any response to LeaderboardResponse
                    val gson = Gson()
                    val json = gson.toJson(r.body()!!.data)
                    val parsed = gson.fromJson<LeaderboardResponse>(json, LeaderboardResponse::class.java)
                    _data.value = UiState.Success(parsed)
                } else {
                    _data.value = UiState.Error("Leaderboard load nahi hua")
                }
            } catch (e: Exception) {
                _data.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }
}
