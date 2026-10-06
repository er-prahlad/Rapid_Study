package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.rapidstudy.data.model.MockTest
import com.rapidstudy.ui.navigation.Screen
import com.rapidstudy.ui.theme.*
import com.rapidstudy.ui.viewmodel.MockTestViewModel
import com.rapidstudy.ui.viewmodel.UiState

@Composable
fun MockTestsScreen(navController: NavController, viewModel: MockTestViewModel) {
    val testsState by viewModel.tests.collectAsStateWithLifecycle()
    val exams      by viewModel.exams.collectAsStateWithLifecycle()
    var selectedExamId by remember { mutableStateOf<Long?>(null) }

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        // Header
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(16.dp)
        ) {
            Column {
                Text("Mock Tests", style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold, color = Color.White)
                Text("Full-length practice tests", style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f))
            }
        }

        // Exam filter chips
        if (exams.isNotEmpty()) {
            LazyRow(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedExamId == null,
                        onClick  = { selectedExamId = null; viewModel.loadTests(null) },
                        label    = { Text("All", style = MaterialTheme.typography.labelMedium) }
                    )
                }
                items(exams) { exam ->
                    FilterChip(
                        selected = selectedExamId == exam.id,
                        onClick  = { selectedExamId = exam.id; viewModel.loadTests(exam.id) },
                        label    = { Text(exam.name, style = MaterialTheme.typography.labelMedium) },
                        colors   = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Primary,
                            selectedLabelColor     = Color.White
                        )
                    )
                }
            }
        }

        // Tests list
        when (val state = testsState) {
            is UiState.Loading -> LoadingGrid()
            is UiState.Error   -> ErrorMessage(state.message) { viewModel.loadTests() }
            is UiState.Success -> {
                val tests = state.data.content
                if (tests.isEmpty()) {
                    EmptyState("No tests available", "Abhi koi test publish nahi hua hai")
                } else {
                    LazyColumn(
                        contentPadding       = PaddingValues(12.dp),
                        verticalArrangement  = Arrangement.spacedBy(10.dp)
                    ) {
                        items(tests) { test ->
                            MockTestCard(test = test, onClick = {
                                navController.navigate(Screen.TestInstructions.createRoute(test.id))
                            })
                        }
                        // Pagination
                        item {
                            PaginationRow(
                                currentPage = state.data.number,
                                totalPages  = state.data.totalPages,
                                onPrev      = { viewModel.prevPage() },
                                onNext      = { viewModel.nextPage() }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MockTestCard(test: MockTest, onClick: () -> Unit) {
    Card(
        modifier  = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape     = RoundedCornerShape(16.dp),
        colors    = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            test.examName?.let {
                Text(it, style = MaterialTheme.typography.labelSmall, color = Primary)
                Spacer(modifier = Modifier.height(4.dp))
            }
            Text(test.title, style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold, maxLines = 2, overflow = TextOverflow.Ellipsis)
            test.description?.let {
                Spacer(modifier = Modifier.height(4.dp))
                Text(it, style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant,
                    maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatBadge(Icons.Outlined.Quiz,   "${test.totalQuestions} Qs")
                StatBadge(Icons.Outlined.EmojiEvents, "${test.totalMarks.toInt()} Marks")
                StatBadge(Icons.Outlined.Timer,  "${test.durationMinutes}m")
            }
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onClick,
                modifier = Modifier.fillMaxWidth(),
                shape    = RoundedCornerShape(10.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = Primary)
            ) {
                Icon(Icons.Outlined.PlayArrow, null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Start Test", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
fun StatBadge(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String) {
    Row(
        modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(PrimaryContainer)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = Primary, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(3.dp))
        Text(label, style = MaterialTheme.typography.labelSmall, color = Primary)
    }
}

@Composable
fun LoadingGrid() {
    LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items(4) {
            Card(modifier = Modifier.fillMaxWidth().height(140.dp), shape = RoundedCornerShape(16.dp)) {
                Box(modifier = Modifier.fillMaxSize().background(SurfaceVariant))
            }
        }
    }
}

@Composable
fun ErrorMessage(msg: String, onRetry: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
            Icon(Icons.Outlined.ErrorOutline, null, tint = Error, modifier = Modifier.size(48.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text(msg, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = Primary)) {
                Text("Retry")
            }
        }
    }
}

@Composable
fun EmptyState(title: String, subtitle: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
            Icon(Icons.Outlined.Inbox, null, tint = Primary.copy(alpha = 0.3f), modifier = Modifier.size(64.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
        }
    }
}

@Composable
fun PaginationRow(currentPage: Int, totalPages: Int, onPrev: () -> Unit, onNext: () -> Unit) {
    if (totalPages <= 1) return
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
        OutlinedButton(onClick = onPrev, enabled = currentPage > 0) { Text("Previous") }
        Spacer(modifier = Modifier.width(12.dp))
        Text("${currentPage + 1} / $totalPages", style = MaterialTheme.typography.labelMedium, color = OnSurfaceVariant)
        Spacer(modifier = Modifier.width(12.dp))
        OutlinedButton(onClick = onNext, enabled = currentPage < totalPages - 1) { Text("Next") }
    }
}
