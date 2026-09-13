package com.rapidstudy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rapidstudy.data.local.TokenManager
import com.rapidstudy.data.model.LoginRequest
import com.rapidstudy.data.model.RegisterRequest
import com.rapidstudy.data.remote.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _loginState  = MutableStateFlow<UiState<Unit>?>(null)
    val loginState: StateFlow<UiState<Unit>?> = _loginState

    private val _registerState = MutableStateFlow<UiState<Unit>?>(null)
    val registerState: StateFlow<UiState<Unit>?> = _registerState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            try {
                val response = apiService.login(LoginRequest(email, password))
                if (response.isSuccessful && response.body()?.data != null) {
                    val auth = response.body()!!.data!!
                    tokenManager.saveTokens(
                        auth.accessToken, auth.refreshToken,
                        auth.userId, auth.name, auth.email, auth.role
                    )
                    _loginState.value = UiState.Success(Unit)
                } else {
                    val msg = response.body()?.message ?: "Login failed"
                    _loginState.value = UiState.Error(msg)
                }
            } catch (e: Exception) {
                _loginState.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun register(name: String, email: String, password: String, phone: String?) {
        viewModelScope.launch {
            _registerState.value = UiState.Loading
            try {
                val response = apiService.register(RegisterRequest(name, email, password, phone))
                if (response.isSuccessful && response.body()?.data != null) {
                    val auth = response.body()!!.data!!
                    tokenManager.saveTokens(
                        auth.accessToken, auth.refreshToken,
                        auth.userId, auth.name, auth.email, auth.role
                    )
                    _registerState.value = UiState.Success(Unit)
                } else {
                    _registerState.value = UiState.Error(response.body()?.message ?: "Registration failed")
                }
            } catch (e: Exception) {
                _registerState.value = UiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try { apiService.logout() } catch (_: Exception) {}
            tokenManager.clearTokens()
        }
    }
}
