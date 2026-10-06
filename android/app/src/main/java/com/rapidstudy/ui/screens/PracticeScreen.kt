package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
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
import com.rapidstudy.data.model.QuestionSafeDto
import com.rapidstudy.ui.theme.*
import com.rapidstudy.ui.viewmodel.PracticeViewModel
import com.rapidstudy.ui.viewmodel.UiState

@Composable
fun PracticeScreen(viewModel: PracticeViewModel) {
    val questionsState by viewModel.questions.collectAsStateWithLifecycle()
    val answers        by viewModel.answers.collectAsStateWithLifecycle()
    val revealed       by viewModel.revealed.collectAsStateWithLifecycle()
    val bookmarked     by viewModel.bookmarked.collectAsStateWithLifecycle()
    var currentIndex   by remember { mutableStateOf(0) }

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        // Header
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(16.dp)
        ) {
            Column {
                Text("Practice", style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold, color = Color.White)
                Spacer(modifier = Modifier.height(10.dp))
                // Difficulty filters
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(null to "All", "EASY" to "Easy", "MEDIUM" to "Medium", "HARD" to "Hard")
                        .forEach { (diff, label) ->
                            val isSelected = viewModel.difficulty == diff
                            FilterChip(
                                selected = isSelected,
                                onClick  = { viewModel.load(diff); currentIndex = 0 },
                                label    = { Text(label, style = MaterialTheme.typography.labelSmall) },
                                colors   = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color.White,
                                    selectedLabelColor     = Primary,
                                    containerColor         = Color.White.copy(alpha = 0.2f),
                                    labelColor             = Color.White
                                )
                            )
                        }
                }
            }
        }

        when (val state = questionsState) {
            is UiState.Loading -> LoadingGrid()
            is UiState.Error   -> ErrorMessage(state.message) { viewModel.load() }
            is UiState.Success -> {
                val questions = state.data.content
                if (questions.isEmpty()) {
                    EmptyState("Koi question nahi", "Is difficulty mein questions nahi hain")
                } else {
                    val question = questions.getOrNull(currentIndex)
                    if (question != null) {
                        Column(modifier = Modifier.weight(1f)) {
                            // Progress indicator
                            LinearProgressIndicator(
                                progress = (currentIndex + 1).toFloat() / questions.size,
                                modifier = Modifier.fillMaxWidth().height(3.dp),
                                color    = Primary, trackColor = PrimaryContainer
                            )
                            LazyColumn(
                                contentPadding      = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp),
                                modifier            = Modifier.weight(1f)
                            ) {
                                item {
                                    PracticeQuestionCard(
                                        question   = question,
                                        index      = currentIndex,
                                        total      = questions.size,
                                        selected   = answers[question.id],
                                        isRevealed = question.id in revealed,
                                        isBookmarked = question.id in bookmarked,
                                        onSelect   = { optId -> viewModel.selectOption(question.id, optId) },
                                        onReveal   = { viewModel.revealAnswer(question.id) },
                                        onBookmark = { viewModel.toggleBookmark(question.id) }
                                    )
                                }
                            }
                            // Navigation
                            Row(
                                modifier = Modifier.fillMaxWidth().background(Surface)
                                    .padding(horizontal = 16.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick  = { if (currentIndex > 0) currentIndex-- },
                                    enabled  = currentIndex > 0,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Outlined.ChevronLeft, null, modifier = Modifier.size(18.dp))
                                    Text("Prev")
                                }
                                Button(
                                    onClick  = {
                                        if (currentIndex < questions.size - 1) currentIndex++
                                        else viewModel.nextPage().also { currentIndex = 0 }
                                    },
                                    modifier = Modifier.weight(1f),
                                    colors   = ButtonDefaults.buttonColors(containerColor = Primary)
                                ) {
                                    Text("Next")
                                    Icon(Icons.Outlined.ChevronRight, null, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PracticeQuestionCard(
    question: QuestionSafeDto, index: Int, total: Int,
    selected: Long?, isRevealed: Boolean, isBookmarked: Boolean,
    onSelect: (Long) -> Unit, onReveal: () -> Unit, onBookmark: () -> Unit
) {
    Column {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Q ${index+1}/$total", style = MaterialTheme.typography.labelLarge, color = OnSurfaceVariant)
            Row(verticalAlignment = Alignment.CenterVertically) {
                DifficultyChip(question.difficulty)
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(onClick = onBookmark, modifier = Modifier.size(36.dp)) {
                    Icon(
                        if (isBookmarked) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                        null, tint = if (isBookmarked) Primary else OnSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Question text
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape    = RoundedCornerShape(14.dp),
            colors   = CardDefaults.cardColors(containerColor = Surface),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(question.questionText, style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium)
                question.questionTextHindi?.let {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(it, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Options
        question.options.forEach { opt ->
            val isSelected = selected == opt.id
            val isCorrect  = if (isRevealed) opt.isCorrect == true else null
            val bgColor = when {
                isRevealed && isCorrect == true  -> Color(0xFFE8F5E9)
                isRevealed && isSelected         -> Color(0xFFFFEBEE)
                isSelected                       -> PrimaryContainer
                else                             -> Surface
            }
            val borderColor = when {
                isRevealed && isCorrect == true  -> Success
                isRevealed && isSelected         -> Error
                isSelected                       -> Primary
                else                             -> Color(0xFFE0E0E0)
            }
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                    .clickable(enabled = !isRevealed) { onSelect(opt.id) },
                shape    = RoundedCornerShape(12.dp),
                colors   = CardDefaults.cardColors(containerColor = bgColor),
                border   = BorderStroke(if (isSelected || (isRevealed && isCorrect == true)) 2.dp else 1.dp, borderColor)
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier.size(28.dp).clip(RoundedCornerShape(14.dp))
                            .background(if (isSelected || (isRevealed && isCorrect == true)) Primary else Color(0xFFEEEEEE)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("${opt.optionOrder}", style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected || (isRevealed && isCorrect == true)) Color.White else OnSurfaceVariant)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(opt.optionText, modifier = Modifier.weight(1f),
                        style = MaterialTheme.typography.bodyMedium)
                    if (isRevealed && isCorrect == true)
                        Icon(Icons.Outlined.CheckCircle, null, tint = Success, modifier = Modifier.size(20.dp))
                    if (isRevealed && isSelected && isCorrect != true)
                        Icon(Icons.Outlined.Cancel, null, tint = Error, modifier = Modifier.size(20.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Show answer button
        if (!isRevealed) {
            OutlinedButton(
                onClick  = onReveal,
                enabled  = selected != null,
                modifier = Modifier.fillMaxWidth(),
                shape    = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Outlined.Visibility, null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Show Answer")
            }
        } else {
            // Correct answer feedback
            val isCorrectAnswer = question.options.find { it.id == selected }?.isCorrect == true
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape    = RoundedCornerShape(12.dp),
                colors   = CardDefaults.cardColors(
                    containerColor = if (isCorrectAnswer) Color(0xFFE8F5E9) else Color(0xFFFFEBEE)
                )
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        if (isCorrectAnswer) Icons.Outlined.CheckCircle else Icons.Outlined.Cancel,
                        null,
                        tint     = if (isCorrectAnswer) Success else Error,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        if (isCorrectAnswer) "Sahi jawab! +${question.marks}" else "Galat. -${question.negativeMarks}",
                        style      = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color      = if (isCorrectAnswer) Success else Error
                    )
                }
            }
        }
    }
}
