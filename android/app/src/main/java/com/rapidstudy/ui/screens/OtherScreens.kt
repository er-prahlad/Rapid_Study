package com.rapidstudy.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.rapidstudy.ui.theme.OnSurfaceVariant
import com.rapidstudy.ui.theme.Primary

/** Reusable placeholder screen jab tak full implementation nahi hota */
@Composable
fun PlaceholderScreen(title: String, icon: ImageVector, message: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = null, tint = Primary.copy(alpha = 0.4f),
                modifier = Modifier.size(64.dp))
            Spacer(modifier = Modifier.height(16.dp))
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(message, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
        }
    }
}

@Composable fun MockTestsScreen(navController: NavController) =
    PlaceholderScreen("Mock Tests", Icons.Outlined.Assignment, "Available tests yahan dikhenge")

@Composable fun ExamListScreen(navController: NavController) =
    PlaceholderScreen("Exams", Icons.Outlined.School, "SSC, UPSC, BPSC aur baaki exams")

@Composable fun StudyPlanScreen() =
    PlaceholderScreen("Study Plan", Icons.Outlined.CalendarMonth, "Apna study plan banao")

@Composable fun NotificationsScreen() =
    PlaceholderScreen("Notifications", Icons.Outlined.NotificationsNone, "Koi notification nahi hai")

@Composable fun PracticeScreen() =
    PlaceholderScreen("Practice", Icons.Outlined.MenuBook, "Questions practice karo")

@Composable fun BookmarksScreen() =
    PlaceholderScreen("Bookmarks", Icons.Outlined.Bookmarks, "Saved questions yahan milenge")

@Composable fun LeaderboardScreen() =
    PlaceholderScreen("Leaderboard", Icons.Outlined.EmojiEvents, "Top performers ki list")

@Composable fun ProfileScreen(onLogout: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))
        Icon(Icons.Outlined.AccountCircle, contentDescription = null,
            tint = Primary, modifier = Modifier.size(80.dp))
        Spacer(modifier = Modifier.height(16.dp))
        Text("Profile", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick  = onLogout,
            modifier = Modifier.fillMaxWidth(),
            colors   = ButtonDefaults.buttonColors(containerColor = androidx.compose.ui.graphics.Color(0xFFD32F2F))
        ) {
            Icon(Icons.Outlined.Logout, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sign Out")
        }
    }
}
