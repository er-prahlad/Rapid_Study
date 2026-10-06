package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rapidstudy.data.local.TokenManager
import com.rapidstudy.ui.theme.*
import kotlinx.coroutines.flow.map

@Composable
fun ProfileScreen(
    tokenManager: TokenManager,
    onLogout:     () -> Unit
) {
    val userName  by tokenManager.userName.collectAsStateWithLifecycle(initialValue = "")
    val userEmail by tokenManager.userId.collectAsStateWithLifecycle(initialValue = "")
    var showLogoutDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState())
    ) {
        // Green header with avatar
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // Avatar
                Box(
                    modifier = Modifier.size(80.dp).clip(CircleShape).background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        (userName ?: "U").take(2).uppercase(),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = Primary
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(userName ?: "Student", style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold, color = Color.White)
                Text("RapidStudy Student", style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Menu items
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape    = RoundedCornerShape(16.dp),
            colors   = CardDefaults.cardColors(containerColor = Surface),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column {
                ProfileMenuItem(Icons.Outlined.Person,       "My Profile",     "Personal information") {}
                HorizontalDivider(color = Color(0xFFF5F5F5))
                ProfileMenuItem(Icons.Outlined.BarChart,     "My Performance", "Statistics & analytics") {}
                HorizontalDivider(color = Color(0xFFF5F5F5))
                ProfileMenuItem(Icons.Outlined.Bookmarks,    "Bookmarks",      "Saved questions") {}
                HorizontalDivider(color = Color(0xFFF5F5F5))
                ProfileMenuItem(Icons.Outlined.Notifications,"Notifications",  "Notification settings") {}
                HorizontalDivider(color = Color(0xFFF5F5F5))
                ProfileMenuItem(Icons.Outlined.Language,     "Language",       "English / Hindi / Hineng") {}
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // App info
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape    = RoundedCornerShape(16.dp),
            colors   = CardDefaults.cardColors(containerColor = Surface),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column {
                ProfileMenuItem(Icons.Outlined.Info,    "App Version", "1.0.0") {}
                HorizontalDivider(color = Color(0xFFF5F5F5))
                ProfileMenuItem(Icons.Outlined.Help,    "Help & Support", "FAQ, Contact us") {}
                HorizontalDivider(color = Color(0xFFF5F5F5))
                ProfileMenuItem(Icons.Outlined.Shield,  "Privacy Policy", "How we use your data") {}
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Logout button
        Button(
            onClick  = { showLogoutDialog = true },
            modifier = Modifier.fillMaxWidth().height(52.dp).padding(horizontal = 16.dp),
            shape    = RoundedCornerShape(14.dp),
            colors   = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F))
        ) {
            Icon(Icons.Outlined.Logout, null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sign Out", fontWeight = FontWeight.SemiBold)
        }

        Spacer(modifier = Modifier.height(32.dp))
    }

    // Logout confirmation
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            icon    = { Icon(Icons.Outlined.Logout, null, tint = Color(0xFFD32F2F)) },
            title   = { Text("Sign Out?", fontWeight = FontWeight.Bold) },
            text    = { Text("Kya aap sign out karna chahte ho?") },
            confirmButton = {
                Button(onClick = { showLogoutDialog = false; onLogout() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F))) {
                    Text("Sign Out")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showLogoutDialog = false }) { Text("Cancel") }
            }
        )
    }
}

@Composable
fun ProfileMenuItem(icon: ImageVector, title: String, subtitle: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(40.dp).clip(RoundedCornerShape(10.dp)).background(PrimaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, null, tint = Primary, modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text(subtitle, style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant)
        }
        Icon(Icons.Outlined.ChevronRight, null, tint = OnSurfaceVariant.copy(alpha = 0.5f))
    }
}
