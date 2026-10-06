package com.rapidstudy.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.rapidstudy.data.local.TokenManager
import com.rapidstudy.data.model.DashboardResponse
import com.rapidstudy.data.model.StartAttemptResponse
import com.rapidstudy.data.model.SubmitResponse
import com.rapidstudy.data.remote.ApiService
import com.rapidstudy.ui.navigation.Screen
import com.rapidstudy.ui.theme.Primary
import com.rapidstudy.ui.viewmodel.*
import kotlinx.coroutines.launch

data class BottomNavItem(
    val label: String, val route: String,
    val iconFilled: ImageVector, val iconOutline: ImageVector
)

@Composable
fun MainScreen(
    dashboard:    DashboardResponse?,
    userName:     String,
    apiService:   ApiService,
    tokenManager: TokenManager,
    onRefresh:    () -> Unit,
    onLogout:     () -> Unit
) {
    val navController = rememberNavController()

    // ViewModels — ek baar create ho, reuse ho
    val testViewModel        = rememberViewModel { TestViewModel(apiService) }
    val mockTestViewModel    = rememberViewModel { MockTestViewModel(apiService) }
    val examViewModel        = rememberViewModel { ExamViewModel(apiService) }
    val practiceViewModel    = rememberViewModel { PracticeViewModel(apiService) }
    val leaderboardViewModel = rememberViewModel { LeaderboardViewModel(apiService) }
    val notifViewModel       = rememberViewModel { NotificationViewModel(apiService) }

    val unreadCount by notifViewModel.unreadCount.collectAsStateWithLifecycle()

    val navItems = listOf(
        BottomNavItem("Home",          Screen.Home.route,          Icons.Filled.Home,          Icons.Outlined.Home),
        BottomNavItem("Mock Tests",    Screen.MockTests.route,     Icons.Filled.Assignment,    Icons.Outlined.Assignment),
        BottomNavItem("Study Plan",    Screen.StudyPlan.route,     Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth),
        BottomNavItem("Notifications", Screen.Notifications.route, Icons.Filled.Notifications, Icons.Outlined.NotificationsNone),
    )

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = androidx.compose.ui.graphics.Color.White) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                navItems.forEach { item ->
                    val selected = currentRoute == item.route
                    NavigationBarItem(
                        selected = selected,
                        onClick  = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true; restoreState = true
                            }
                        },
                        icon  = {
                            BadgedBox(
                                badge = {
                                    if (item.route == Screen.Notifications.route && unreadCount > 0) {
                                        Badge { Text("$unreadCount") }
                                    }
                                }
                            ) {
                                Icon(
                                    if (selected) item.iconFilled else item.iconOutline,
                                    item.label
                                )
                            }
                        },
                        label  = { Text(item.label, style = MaterialTheme.typography.labelSmall) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor   = Primary,
                            selectedTextColor   = Primary,
                            indicatorColor      = androidx.compose.ui.graphics.Color.White,
                            unselectedIconColor = androidx.compose.ui.graphics.Color(0xFF757575),
                            unselectedTextColor = androidx.compose.ui.graphics.Color(0xFF757575)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController    = navController,
            startDestination = Screen.Home.route,
            modifier         = Modifier.padding(paddingValues)
        ) {
            // ── Bottom nav screens ───────────────────────────────────────
            composable(Screen.Home.route) {
                HomeScreen(navController = navController, dashboard = dashboard,
                    userName = userName, onRefresh = onRefresh)
            }
            composable(Screen.MockTests.route) {
                MockTestsScreen(navController = navController, viewModel = mockTestViewModel)
            }
            composable(Screen.StudyPlan.route) {
                StudyPlanScreen()
            }
            composable(Screen.Notifications.route) {
                NotificationsScreen(viewModel = notifViewModel)
            }

            // ── Other screens ────────────────────────────────────────────
            composable(Screen.ExamList.route) {
                ExamListScreen(navController = navController, viewModel = examViewModel)
            }
            composable(Screen.Practice.route) {
                PracticeScreen(viewModel = practiceViewModel)
            }
            composable(Screen.Bookmarks.route) {
                BookmarksScreen()
            }
            composable(Screen.Leaderboard.route) {
                LeaderboardScreen(viewModel = leaderboardViewModel)
            }
            composable(Screen.Profile.route) {
                ProfileScreen(tokenManager = tokenManager, onLogout = onLogout)
            }

            // ── Test flow ────────────────────────────────────────────────
            composable(Screen.TestInstructions.route) { backStack ->
                val testId = backStack.arguments?.getString("testId")?.toLongOrNull() ?: return@composable
                val startState by testViewModel.startState.collectAsStateWithLifecycle()
                TestInstructionsScreen(
                    test      = null,
                    isLoading = startState is UiState.Loading,
                    onStart   = {
                        testViewModel.startAttempt(testId)
                    },
                    onBack    = { navController.popBackStack() }
                )
                // Navigate when attempt started
                LaunchedEffect(startState) {
                    if (startState is UiState.Success<*>) {
                        val aId = (startState as UiState.Success<*>).data
                        if (aId != null) {
                            @Suppress("UNCHECKED_CAST")
                            val attemptId = ((startState as UiState.Success<com.rapidstudy.data.model.StartAttemptResponse>).data).attemptId
                            navController.navigate(Screen.TestAttempt.createRoute(attemptId)) {
                                popUpTo(Screen.TestInstructions.route) { inclusive = true }
                            }
                        }
                    }
                }
            }

            composable(Screen.TestAttempt.route) {
                TestAttemptScreen(
                    viewModel   = testViewModel,
                    onSubmitted = { aId ->
                        navController.navigate(Screen.TestResult.createRoute(aId)) {
                            popUpTo(Screen.TestAttempt.route) { inclusive = true }
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.TestResult.route) {
                val submitState by testViewModel.submitState.collectAsStateWithLifecycle()
                val result = (submitState as? UiState.Success<SubmitResponse>)?.data
                TestResultScreen(
                    result        = result,
                    isLoading     = submitState is UiState.Loading,
                    onGoHome      = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(navController.graph.id) { inclusive = true }
                        }
                    },
                    onTakeAnother = {
                        navController.navigate(Screen.MockTests.route) {
                            popUpTo(Screen.TestResult.route) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}

/** Helper: ViewModel ko remember karo taaki recomposition pe nahi bane */
@Composable
inline fun <reified VM : ViewModel> rememberViewModel(
    crossinline factory: () -> VM
): VM {
    return androidx.lifecycle.viewmodel.compose.viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return factory() as T
            }
        }
    )
}
