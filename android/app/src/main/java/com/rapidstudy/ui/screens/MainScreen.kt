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
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.rapidstudy.data.model.DashboardResponse
import com.rapidstudy.data.remote.ApiService
import com.rapidstudy.ui.navigation.Screen
import com.rapidstudy.ui.theme.Primary
import com.rapidstudy.ui.viewmodel.TestViewModel
import com.rapidstudy.ui.viewmodel.UiState

data class BottomNavItem(
    val label:       String,
    val route:       String,
    val iconFilled:  ImageVector,
    val iconOutline: ImageVector
)

/**
 * Image jaisa bottom nav:
 * Home | Mock Tests | Study Plan | Notifications
 */
@Composable
fun MainScreen(
    dashboard:  DashboardResponse?,
    userName:   String,
    apiService: ApiService,
    onRefresh:  () -> Unit,
    onLogout:   () -> Unit
) {
    val navController = rememberNavController()

    // TestViewModel — test ke liye
    val testViewModel = remember {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return TestViewModel(apiService) as T
            }
        }.create(TestViewModel::class.java)
    }

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
                                launchSingleTop = true
                                restoreState    = true
                            }
                        },
                        icon = {
                            Icon(
                                imageVector     = if (selected) item.iconFilled else item.iconOutline,
                                contentDescription = item.label
                            )
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
            composable(Screen.Home.route) {
                HomeScreen(
                    navController = navController,
                    dashboard     = dashboard,
                    userName      = userName,
                    onRefresh     = onRefresh
                )
            }
            composable(Screen.MockTests.route) {
                MockTestsScreen(navController = navController)
            }
            composable(Screen.StudyPlan.route) {
                StudyPlanScreen()
            }
            composable(Screen.Notifications.route) {
                NotificationsScreen()
            }
            composable(Screen.ExamList.route) {
                ExamListScreen(navController = navController)
            }
            composable(Screen.Practice.route) {
                PracticeScreen()
            }
            composable(Screen.Bookmarks.route) {
                BookmarksScreen()
            }
            composable(Screen.Leaderboard.route) {
                LeaderboardScreen()
            }
            composable(Screen.Profile.route) {
                ProfileScreen(onLogout = onLogout)
            }

            // ── Test flow screens ─────────────────────────────────────────

            composable(Screen.TestInstructions.route) { backStackEntry ->
                val testId = backStackEntry.arguments?.getString("testId")?.toLongOrNull() ?: return@composable
                val startState by testViewModel.startState.collectAsState()
                TestInstructionsScreen(
                    test      = null, // TestDetail API se aayega — placeholder
                    isLoading = startState is UiState.Loading,
                    onStart   = {
                        testViewModel.startAttempt(testId)
                        navController.navigate(Screen.TestAttempt.createRoute(testId))
                    },
                    onBack    = { navController.popBackStack() }
                )
            }

            composable(Screen.TestAttempt.route) { backStackEntry ->
                val attemptId = backStackEntry.arguments?.getString("attemptId")?.toLongOrNull() ?: return@composable
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

            composable(Screen.TestResult.route) { backStackEntry ->
                val submitState by testViewModel.submitState.collectAsState()
                val result = (submitState as? UiState.Success<com.rapidstudy.data.model.SubmitResponse>)?.data
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
