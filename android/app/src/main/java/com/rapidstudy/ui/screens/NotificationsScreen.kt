package com.rapidstudy.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rapidstudy.ui.theme.*
import com.rapidstudy.ui.viewmodel.NotificationItem
import com.rapidstudy.ui.viewmodel.NotificationViewModel
import com.rapidstudy.ui.viewmodel.UiState

@Composable
fun NotificationsScreen(viewModel: NotificationViewModel) {
    val state      by viewModel.notifications.collectAsStateWithLifecycle()
    val unread     by viewModel.unreadCount.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Notifications", style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold, color = Color.White)
                    if (unread > 0)
                        Text("$unread unread", style = MaterialTheme.typography.bodySmall,
                            color = Color.White.copy(alpha = 0.8f))
                }
                if (unread > 0) {
                    TextButton(onClick = { viewModel.markAllRead() }) {
                        Text("Mark all read", color = Color.White, style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }

        when (val s = state) {
            is UiState.Loading -> LoadingGrid()
            is UiState.Error   -> ErrorMessage(s.message) { viewModel.load() }
            is UiState.Success -> {
                val notifications = s.data
                if (notifications.isEmpty()) {
                    EmptyState("Koi notification nahi", "Abhi tak koi notification nahi aayi")
                } else {
                    LazyColumn(
                        contentPadding      = PaddingValues(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(notifications) { notif ->
                            NotificationCard(notif = notif, onRead = { viewModel.markRead(notif.id) })
                        }
                    }
                }
            }
        }
    }
}

val NOTIF_TYPE_CONFIG = mapOf(
    "SYSTEM"        to (Color(0xFF1565C0) to Icons.Outlined.Info),
    "TEST_REMINDER" to (Primary             to Icons.Outlined.Notifications),
    "STUDY_PLAN"    to (Success             to Icons.Outlined.CalendarMonth),
    "ACHIEVEMENT"   to (Color(0xFFFF8F00)   to Icons.Outlined.EmojiEvents),
    "LEADERBOARD"   to (Color(0xFF6A1B9A)   to Icons.Outlined.Leaderboard),
)

@Composable
fun NotificationCard(notif: NotificationItem, onRead: () -> Unit) {
    val (color, icon) = NOTIF_TYPE_CONFIG[notif.type] ?: (Primary to Icons.Outlined.Notifications)

    Card(
        modifier  = Modifier.fillMaxWidth().clickable(enabled = !notif.isRead, onClick = onRead),
        shape     = RoundedCornerShape(12.dp),
        colors    = CardDefaults.cardColors(
            containerColor = if (notif.isRead) Surface else color.copy(alpha = 0.05f)
        ),
        border    = if (!notif.isRead) BorderStroke(1.dp, color.copy(alpha = 0.3f)) else null
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.Top) {
            // Icon circle
            Box(
                modifier = Modifier.size(38.dp).clip(CircleShape)
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        notif.title,
                        style      = MaterialTheme.typography.bodyMedium,
                        fontWeight = if (!notif.isRead) FontWeight.SemiBold else FontWeight.Normal
                    )
                    if (!notif.isRead) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(color))
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(notif.message, style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant,
                    maxLines = 2)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    formatTimeAgo(notif.createdAt),
                    style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant.copy(alpha = 0.7f)
                )
            }
        }
    }
}

fun formatTimeAgo(dateStr: String): String {
    return try {
        val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
        val date = fmt.parse(dateStr.substringBefore(".")) ?: return dateStr
        val diffMs   = System.currentTimeMillis() - date.time
        val diffMins = diffMs / 60000
        when {
            diffMins < 60   -> "${diffMins}m ago"
            diffMins < 1440 -> "${diffMins / 60}h ago"
            else            -> "${diffMins / 1440}d ago"
        }
    } catch (_: Exception) { dateStr }
}
