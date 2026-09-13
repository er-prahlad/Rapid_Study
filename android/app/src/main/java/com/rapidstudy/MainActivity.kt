package com.rapidstudy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rapidstudy.data.local.TokenManager
import com.rapidstudy.data.model.DashboardResponse
import com.rapidstudy.data.remote.RetrofitClient
import com.rapidstudy.ui.screens.*
import com.rapidstudy.ui.theme.RapidStudyTheme
import com.rapidstudy.ui.viewmodel.AuthViewModel
import com.rapidstudy.ui.viewmodel.HomeViewModel
import com.rapidstudy.ui.viewmodel.UiState
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import com.rapidstudy.data.remote.ApiService

/**
 * Phase 49: Main entry point
 * Splash → Login/Register (agar token nahi) → Main (agar token hai)
 */
class MainActivity : ComponentActivity() {

    private lateinit var tokenManager: TokenManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        tokenManager = TokenManager(applicationContext)
        val apiService = RetrofitClient.create(tokenManager)

        val authViewModel: AuthViewModel by viewModels {
            object : ViewModelProvider.Factory {
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    @Suppress("UNCHECKED_CAST")
                    return AuthViewModel(apiService, tokenManager) as T
                }
            }
        }

        val homeViewModel: HomeViewModel by viewModels {
            object : ViewModelProvider.Factory {
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    @Suppress("UNCHECKED_CAST")
                    return HomeViewModel(apiService) as T
                }
            }
        }

        setContent {
            RapidStudyTheme {
                RapidStudyApp(
                    tokenManager  = tokenManager,
                    authViewModel = authViewModel,
                    homeViewModel = homeViewModel,
                    apiService = apiService
                )
            }
        }
    }
}

// ── App navigation controller ──────────────────────────────────────────────────

enum class AppScreen { SPLASH, LOGIN, REGISTER, MAIN }

@Composable
fun RapidStudyApp(
    tokenManager:  TokenManager,
    authViewModel: AuthViewModel,
    homeViewModel: HomeViewModel,
    apiService: ApiService
) {
    var currentScreen by remember { mutableStateOf(AppScreen.SPLASH) }

    val loginState    by authViewModel.loginState.collectAsStateWithLifecycle()
    val registerState by authViewModel.registerState.collectAsStateWithLifecycle()
    val dashboardState by homeViewModel.dashboard.collectAsStateWithLifecycle()
    val userName by tokenManager.userName.collectAsStateWithLifecycle(initialValue = "Student")

    // Login/Register success → go to Main
    LaunchedEffect(loginState) {
        if (loginState is UiState.Success) {
            currentScreen = AppScreen.MAIN
            homeViewModel.loadDashboard()
        }
    }
    LaunchedEffect(registerState) {
        if (registerState is UiState.Success) {
            currentScreen = AppScreen.MAIN
            homeViewModel.loadDashboard()
        }
    }

    when (currentScreen) {
        AppScreen.SPLASH -> {
            SplashScreen(onComplete = {
                // Token check karo
                val hasToken = runBlocking { tokenManager.isLoggedIn() }
                currentScreen = if (hasToken) AppScreen.MAIN else AppScreen.LOGIN
                if (hasToken) homeViewModel.loadDashboard()
            })
        }

        AppScreen.LOGIN -> {
            LoginScreen(
                onLogin       = { email, password -> authViewModel.login(email, password) },
                onGoRegister  = { currentScreen = AppScreen.REGISTER },
                isLoading     = loginState is UiState.Loading,
                errorMessage  = (loginState as? UiState.Error)?.message
            )
        }

        AppScreen.REGISTER -> {
            RegisterScreen(
                onRegister    = { name, email, password, phone -> authViewModel.register(name, email, password, phone) },
                onGoLogin     = { currentScreen = AppScreen.LOGIN },
                isLoading     = registerState is UiState.Loading,
                errorMessage  = (registerState as? UiState.Error)?.message
            )
        }

        AppScreen.MAIN -> {
            val dashboard = (dashboardState as? UiState.Success<DashboardResponse>)?.data
            MainScreen(
                dashboard  = dashboard,
                userName   = userName ?: "Student",
                apiService = apiService,
                onRefresh  = { homeViewModel.loadDashboard() },
                onLogout   = {
                    authViewModel.logout()
                    currentScreen = AppScreen.LOGIN
                }
            )
        }
    }
}