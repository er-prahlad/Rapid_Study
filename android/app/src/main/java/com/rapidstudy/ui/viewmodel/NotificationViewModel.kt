package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.remote.ApiService
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.time.LocalDateTime

data class NotificationItem(
    val id: Long, val title: String, val message: String,
    val type: String, val isRead: Boolean, val createdAt: String
)

class NotificationViewModel(private val api: ApiService) : ViewModel() {

    private val _notifications = MutableStateFlow<UiState<List<NotificationItem>>>(UiState.Loading)
    val notifications: StateFlow<UiState<List<NotificationItem>>> = _notifications

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount

    init { load() }

    fun load() = viewModelScope.launch {
        _notifications.value = UiState.Loading
        try {
            val r = api.getNotifications()
            if (r.isSuccessful && r.body()?.data != null) {
                val gson = Gson()
                val json = gson.toJson(r.body()!!.data)
                val type = object : TypeToken<Map<String, Any>>() {}.type
                val map: Map<String, Any> = gson.fromJson(json, type)
                @Suppress("UNCHECKED_CAST")
                val content = (map["content"] as? List<Map<String, Any>>) ?: emptyList()
                val items = content.map { m ->
                    NotificationItem(
                        id        = (m["id"] as? Double)?.toLong() ?: 0L,
                        title     = m["title"] as? String ?: "",
                        message   = m["message"] as? String ?: "",
                        type      = m["type"] as? String ?: "SYSTEM",
                        isRead    = m["isRead"] as? Boolean ?: false,
                        createdAt = m["createdAt"] as? String ?: ""
                    )
                }
                _notifications.value = UiState.Success(items)
                _unreadCount.value   = items.count { !it.isRead }
            } else {
                _notifications.value = UiState.Success(emptyList())
            }
        } catch (e: Exception) {
            _notifications.value = UiState.Error(e.message ?: "Network error")
        }
    }

    fun markRead(id: Long) = viewModelScope.launch {
        try { api.markRead(id); load() } catch (_: Exception) {}
    }

    fun markAllRead() = viewModelScope.launch {
        try { api.markAllRead(); load() } catch (_: Exception) {}
    }
}
