package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.navigation.NavController
import com.rapidstudy.data.model.*
import com.rapidstudy.ui.navigation.Screen
import com.rapidstudy.ui.theme.*

/**
 * Phase 49: Home Screen — image ke jaisa exactly
 * Green gradient header + streak card + stats + daily target + quick actions + popular exams
 */
@Composable
fun HomeScreen(
    navController: NavController,
    dashboard: DashboardResponse?,
    userName: String,
    onRefresh: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(scrollState)
    ) {
        // ── Green gradient header ─────────────────────────────────────
        WelcomeHeader(
            userName   = userName,
            streak     = dashboard?.stats?.currentStreak ?: 0
        )

        Spacer(modifier = Modifier.height(16.dp))

        // ── Stats row ─────────────────────────────────────────────────
        StatsRow(
            stats = dashboard?.stats,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // ── Daily Target ──────────────────────────────────────────────
        DailyTargetCard(
            target   = dashboard?.dailyTarget,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // ── Quick Actions ─────────────────────────────────────────────
        QuickActionsSection(navController = navController)

        Spacer(modifier = Modifier.height(16.dp))

        // ── Popular Exams ─────────────────────────────────────────────
        PopularExamsSection(
            exams       = dashboard?.popularExams ?: emptyList(),
            navController = navController
        )

        Spacer(modifier = Modifier.height(80.dp)) // bottom nav ke liye space
    }
}

// ── Welcome Header (green gradient + streak) ─────────────────────────────────

@Composable
fun WelcomeHeader(userName: String, streak: Int) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(colors = listOf(PrimaryLight, Primary))
            )
            .padding(16.dp)
    ) {
        Row(
            modifier            = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment   = Alignment.Top
        ) {
            // Left: greeting text
            Column(modifier = Modifier.weight(1f)) {
                val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
                val greeting = when {
                    hour < 12 -> "Good morning,"
                    hour < 17 -> "Good afternoon,"
                    else      -> "Good evening,"
                }
                Text(
                    text  = greeting,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.9f)
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text       = userName.uppercase(),
                        style      = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color      = Color.White
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "👋", fontSize = 20.sp)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text  = "Keep up the momentum! Your consistent\npractice is building toward exam success.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.85f),
                    lineHeight = 18.sp
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Right: streak card
            Column(
                modifier            = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.25f))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Outlined.LocalFireDepartment,
                    contentDescription = "Streak",
                    tint   = StreakOrange,
                    modifier = Modifier.size(22.dp)
                )
                Text(
                    text       = "$streak",
                    style      = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color      = Color.White
                )
                Text(
                    text  = "day streak",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White.copy(alpha = 0.85f)
                )
            }
        }
    }
}

// ── Stats Row (4 cards) ───────────────────────────────────────────────────────

@Composable
fun StatsRow(stats: Stats?, modifier: Modifier = Modifier) {
    Row(
        modifier              = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        StatCard(label = "Tests Taken",    value = stats?.testsAttempted?.toString() ?: "0", icon = Icons.Outlined.Assignment,  modifier = Modifier.weight(1f))
        StatCard(label = "Avg Score",      value = "${stats?.averageScore?.toInt() ?: 0}%",   icon = Icons.Outlined.TrendingUp,   modifier = Modifier.weight(1f))
        StatCard(label = "Accuracy",       value = "${stats?.accuracy?.toInt() ?: 0}%",        icon = Icons.Outlined.GpsFixed,    modifier = Modifier.weight(1f))
        StatCard(label = "Current\nRank",  value = "#${stats?.rank ?: 0}",                    icon = Icons.Outlined.EmojiEvents, modifier = Modifier.weight(1f))
    }
}

@Composable
fun StatCard(label: String, value: String, icon: ImageVector, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape    = RoundedCornerShape(12.dp),
        colors   = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(text = label, style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant, lineHeight = 14.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = OnBackground)
            Spacer(modifier = Modifier.height(4.dp))
            Icon(imageVector = icon, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
        }
    }
}

// ── Daily Target Card ─────────────────────────────────────────────────────────

@Composable
fun DailyTargetCard(target: DailyTarget?, modifier: Modifier = Modifier) {
    val qTarget = target?.questionsTarget ?: 20
    val qDone   = target?.questionsDone   ?: 0
    val tTarget = target?.testsTarget     ?: 1
    val tDone   = target?.testsDone       ?: 0
    val qPct    = if (qTarget > 0) qDone.toFloat() / qTarget else 0f
    val tPct    = if (tTarget > 0) tDone.toFloat() / tTarget else 0f

    Card(
        modifier  = modifier.fillMaxWidth(),
        shape     = RoundedCornerShape(16.dp),
        colors    = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.TrackChanges, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Daily Target", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
            }
            Spacer(modifier = Modifier.height(14.dp))

            // Questions
            TargetProgress(
                label   = "Questions practiced",
                done    = qDone,
                target  = qTarget,
                progress = qPct
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Tests
            TargetProgress(
                label   = "Mock tests taken",
                done    = tDone,
                target  = tTarget,
                progress = tPct
            )
        }
    }
}

@Composable
fun TargetProgress(label: String, done: Int, target: Int, progress: Float) {
    Column {
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(label, style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
            Text("$done / $target", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium)
        }
        Spacer(modifier = Modifier.height(6.dp))
        LinearProgressIndicator(
            progress  = progress.coerceIn(0f, 1f),
            modifier  = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
            color     = Primary,
            trackColor = PrimaryContainer
        )
        Spacer(modifier = Modifier.height(3.dp))
        Text(
            text  = "${(progress * 100).toInt()}% complete",
            style = MaterialTheme.typography.labelSmall,
            color = OnSurfaceVariant
        )
    }
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

data class QuickAction(val label: String, val icon: ImageVector, val route: String, val color: Color = Primary)

@Composable
fun QuickActionsSection(navController: NavController) {
    val actions = listOf(
        QuickAction("Home",       Icons.Outlined.Home,         Screen.Home.route),
        QuickAction("Mock Tests", Icons.Outlined.Assignment,    Screen.MockTests.route),
        QuickAction("Practice",   Icons.Outlined.MenuBook,      Screen.Practice.route),
        QuickAction("Bookmarks",  Icons.Outlined.Bookmarks,     Screen.Bookmarks.route),
        QuickAction("Study Plan", Icons.Outlined.CalendarMonth, Screen.StudyPlan.route),
        QuickAction("AI Tutor",   Icons.Outlined.Psychology,    Screen.Practice.route, Secondary),
        QuickAction("Leaderboard",Icons.Outlined.EmojiEvents,   Screen.Leaderboard.route, Secondary),
        QuickAction("Exams",      Icons.Outlined.School,        Screen.ExamList.route),
    )

    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.Bolt, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Quick Actions", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
            }
            TextButton(onClick = { navController.navigate(Screen.ExamList.route) }) {
                Text("All", color = Primary, style = MaterialTheme.typography.labelMedium)
                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 4x2 grid
        actions.chunked(4).forEach { row ->
            Row(
                modifier              = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                row.forEach { action ->
                    QuickActionItem(action = action, onClick = { navController.navigate(action.route) }, modifier = Modifier.weight(1f))
                }
                // Fill remaining spots if less than 4
                repeat(4 - row.size) { Box(modifier = Modifier.weight(1f)) }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun QuickActionItem(action: QuickAction, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier            = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(PrimaryContainer)
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector     = action.icon,
            contentDescription = action.label,
            tint            = action.color,
            modifier        = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text     = action.label,
            style    = MaterialTheme.typography.labelSmall,
            color    = OnBackground,
            maxLines = 1
        )
    }
}

// ── Popular Exams ─────────────────────────────────────────────────────────────

val EXAM_COLORS = mapOf(
    "SSC_CGL"  to Color(0xFF1565C0),
    "SSC_CHSL" to Color(0xFF283593),
    "UPSC_CSE" to Color(0xFF6A1B9A),
    "BPSC"     to Color(0xFF2E7D32),
    "RAILWAY"  to Color(0xFFE65100),
    "BANK_PO"  to Color(0xFF00695C),
)

@Composable
fun PopularExamsSection(exams: List<Exam>, navController: NavController) {
    val displayExams = exams.ifEmpty {
        listOf(
            Exam(0, "SSC CGL",   "SSC_CGL",  null, null, true),
            Exam(0, "UPSC",      "UPSC_CSE", null, null, true),
            Exam(0, "BPSC",      "BPSC",     null, null, true),
            Exam(0, "Railway",   "RAILWAY",  null, null, true),
            Exam(0, "Bank PO",   "BANK_PO",  null, null, true),
            Exam(0, "SSC CHSL",  "SSC_CHSL", null, null, true),
        )
    }

    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.School, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Popular Exams", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
        }
        Spacer(modifier = Modifier.height(10.dp))

        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            items(displayExams) { exam ->
                ExamChip(exam = exam, onClick = {
                    if (exam.id > 0) navController.navigate(Screen.ExamDetail.createRoute(exam.id))
                    else navController.navigate(Screen.ExamList.route)
                })
            }
        }
    }
}

@Composable
fun ExamChip(exam: Exam, onClick: () -> Unit) {
    val bgColor = EXAM_COLORS[exam.code] ?: Primary
    val shortName = when {
        exam.name.length <= 7 -> exam.name
        else -> exam.code.replace("_", " ").split(" ").take(2).joinToString(" ")
    }

    Box(
        modifier            = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(bgColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        Text(
            text       = shortName,
            style      = MaterialTheme.typography.labelMedium,
            color      = Color.White,
            fontWeight = FontWeight.Medium
        )
    }
}
