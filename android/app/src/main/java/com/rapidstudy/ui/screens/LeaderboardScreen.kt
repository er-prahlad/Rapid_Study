package com.rapidstudy.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.rapidstudy.ui.viewmodel.LeaderboardEntry
import com.rapidstudy.ui.viewmodel.LeaderboardViewModel
import com.rapidstudy.ui.viewmodel.UiState

@Composable
fun LeaderboardScreen(viewModel: LeaderboardViewModel) {
    val state    by viewModel.data.collectAsStateWithLifecycle()
    val periods  = listOf("DAILY" to "Today", "WEEKLY" to "This Week", "MONTHLY" to "This Month", "ALL_TIME" to "All Time")
    var selected by remember { mutableStateOf("ALL_TIME") }

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(Color(0xFFFF8F00), Color(0xFFE65100))))
                .padding(16.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.EmojiEvents, null, tint = Color.White, modifier = Modifier.size(28.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Leaderboard", style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold, color = Color.White)
                }
                Spacer(modifier = Modifier.height(12.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(periods) { (key, label) ->
                        FilterChip(
                            selected = selected == key,
                            onClick  = { selected = key; viewModel.load(key) },
                            label    = { Text(label, style = MaterialTheme.typography.labelSmall) },
                            colors   = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color.White,
                                selectedLabelColor     = Color(0xFFE65100),
                                containerColor         = Color.White.copy(alpha = 0.2f),
                                labelColor             = Color.White
                            )
                        )
                    }
                }
            }
        }

        when (val s = state) {
            is UiState.Loading -> LoadingGrid()
            is UiState.Error   -> ErrorMessage(s.message) { viewModel.load() }
            is UiState.Success -> {
                val entries = s.data.entries
                s.data.currentUserRank?.let { rank ->
                    if (entries.none { it.isCurrentUser }) {
                        Card(modifier = Modifier.fillMaxWidth().padding(12.dp),
                            colors = CardDefaults.cardColors(containerColor = PrimaryContainer)) {
                            Text("Aapki rank: #$rank", modifier = Modifier.padding(12.dp),
                                style = MaterialTheme.typography.bodyMedium, color = Primary, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
                LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(entries) { entry -> LeaderboardRow(entry = entry) }
                    if (entries.isEmpty()) item { EmptyState("Koi data nahi", "Is period ke liye koi data nahi hai") }
                }
            }
        }
    }
}

val MEDALS = listOf("🥇", "🥈", "🥉")

@Composable
fun LeaderboardRow(entry: LeaderboardEntry) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape    = RoundedCornerShape(12.dp),
        colors   = CardDefaults.cardColors(
            containerColor = if (entry.isCurrentUser) PrimaryContainer else Surface
        ),
        border   = if (entry.isCurrentUser) BorderStroke(2.dp, Primary) else null,
        elevation = CardDefaults.cardElevation(if (entry.isCurrentUser) 4.dp else 1.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            // Rank
            Box(
                modifier = Modifier.size(36.dp),
                contentAlignment = Alignment.Center
            ) {
                if (entry.rank <= 3) {
                    Text(MEDALS[entry.rank - 1], style = MaterialTheme.typography.titleLarge)
                } else {
                    Text("#${entry.rank}", style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold, color = OnSurfaceVariant)
                }
            }
            Spacer(modifier = Modifier.width(10.dp))
            // Avatar
            Box(
                modifier = Modifier.size(38.dp).clip(CircleShape)
                    .background(PrimaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    entry.name.take(2).uppercase(),
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold, color = Primary
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(entry.name, style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold)
                    if (entry.isCurrentUser) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("(You)", style = MaterialTheme.typography.labelSmall, color = Primary)
                    }
                }
                Text("${entry.testsCompleted} tests", style = MaterialTheme.typography.labelSmall,
                    color = OnSurfaceVariant)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("${entry.averageScore.toInt()}%", style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold, color = Primary)
                Text("acc ${entry.accuracy.toInt()}%", style = MaterialTheme.typography.labelSmall,
                    color = OnSurfaceVariant)
            }
        }
    }
}
