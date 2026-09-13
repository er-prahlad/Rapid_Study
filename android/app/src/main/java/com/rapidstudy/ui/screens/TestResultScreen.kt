package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
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
import com.rapidstudy.data.model.SubmitResponse
import com.rapidstudy.ui.theme.*

@Composable
fun TestResultScreen(
    result:        SubmitResponse?,
    isLoading:     Boolean,
    onGoHome:      () -> Unit,
    onTakeAnother: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState())
    ) {
        // Green hero header
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, PrimaryDark)))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Outlined.EmojiEvents, contentDescription = null, tint = Color.White, modifier = Modifier.size(48.dp))
                Spacer(modifier = Modifier.height(12.dp))
                Text("Test Completed!", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)

                if (result != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "${result.score.toInt()} / ${result.totalMarks.toInt()}",
                        style = MaterialTheme.typography.displaySmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text("${result.percentage.toInt()}%", style = MaterialTheme.typography.titleMedium, color = Color.White.copy(alpha = 0.9f))

                    Spacer(modifier = Modifier.height(12.dp))
                    LinearProgressIndicator(
                        progress    = (result.percentage / 100).toFloat().coerceIn(0f, 1f),
                        modifier    = Modifier.fillMaxWidth(0.8f).height(8.dp).clip(RoundedCornerShape(4.dp)),
                        color       = Color.White,
                        trackColor  = Color.White.copy(alpha = 0.3f)
                    )
                }
            }
        }

        if (isLoading || result == null) {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Primary)
            }
        } else {
            Spacer(modifier = Modifier.height(16.dp))

            // Stats grid
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ResultStatCard("✅ Correct",   result.correctAnswers.toString(), Success, Modifier.weight(1f))
                ResultStatCard("❌ Wrong",     result.wrongAnswers.toString(),   Error,   Modifier.weight(1f))
                ResultStatCard("⏭ Skipped",   result.unanswered.toString(),     OnSurfaceVariant, Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ResultStatCard("🎯 Accuracy",  "${result.accuracy.toInt()}%",   Primary, Modifier.weight(1f))
                ResultStatCard("⏱ Time",
                    run {
                        val s = result.timeTakenSeconds
                        if (s >= 3600) "${s/3600}h ${(s%3600)/60}m" else "${s/60}m ${s%60}s"
                    },
                    OnSurfaceVariant, Modifier.weight(1f))
            }

            if (result.wasExpired) {
                Spacer(modifier = Modifier.height(12.dp))
                Card(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    colors   = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0)),
                    shape    = RoundedCornerShape(12.dp)
                ) {
                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Timer, null, tint = Warning)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Timer expire hone par auto-submit hua tha", style = MaterialTheme.typography.bodySmall, color = Warning)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action buttons
            Column(modifier = Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(
                    onClick = onGoHome,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape    = RoundedCornerShape(14.dp),
                    colors   = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Icon(Icons.Outlined.Home, null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Dashboard Pe Jao", fontWeight = FontWeight.SemiBold)
                }

                OutlinedButton(
                    onClick = onTakeAnother,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape    = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Outlined.Replay, null, tint = Primary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Ek Aur Test Lo", color = Primary, fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun ResultStatCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier  = modifier,
        shape     = RoundedCornerShape(12.dp),
        colors    = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = color)
            Spacer(modifier = Modifier.height(2.dp))
            Text(label, style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant)
        }
    }
}
