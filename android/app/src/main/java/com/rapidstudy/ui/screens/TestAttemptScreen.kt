package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.rapidstudy.data.model.*
import com.rapidstudy.ui.theme.*
import com.rapidstudy.ui.viewmodel.TestViewModel
import androidx.compose.material3.Divider

/**
 * Phase 51: Test Attempt Screen
 * - Server timer (display only)
 * - Question navigation
 * - Save/Clear/Review
 * - Question palette (bottom sheet)
 * - Submit button
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestAttemptScreen(
    viewModel:   TestViewModel,
    onSubmitted: (attemptId: Long) -> Unit,
    onBack:      () -> Unit
) {
    val questions    by viewModel.questions.collectAsState()
    val currentIndex by viewModel.currentIndex.collectAsState()
    val answers      by viewModel.answers.collectAsState()
    val reviewed     by viewModel.reviewed.collectAsState()
    val secondsLeft  by viewModel.secondsLeft.collectAsState()
    val testTitle    by viewModel.testTitle.collectAsState()
    val submitState  by viewModel.submitState.collectAsState()

    var showPalette  by remember { mutableStateOf(false) }
    var showConfirm  by remember { mutableStateOf(false) }

    // Submit success → navigate to result
    LaunchedEffect(submitState) {
        if (submitState is com.rapidstudy.ui.viewmodel.UiState.Success) {
            val result = (submitState as com.rapidstudy.ui.viewmodel.UiState.Success<SubmitResponse>).data
            onSubmitted(result.attemptId)
        }
    }

    val isWarning  = secondsLeft in 61..300
    val isCritical = secondsLeft in 0..60
    val timerColor = when {
        isCritical -> Error
        isWarning  -> Warning
        else       -> Primary
    }

    Scaffold(
        topBar = {
            TestTopBar(
                title       = testTitle,
                secondsLeft = secondsLeft,
                timerColor  = timerColor,
                timerFormatted = viewModel.formatTimer(secondsLeft),
                onShowPalette  = { showPalette = true },
                onSubmitClick  = { showConfirm = true }
            )
        }
    ) { paddingValues ->
        val question = questions.getOrNull(currentIndex)

        Column(
            modifier = Modifier.fillMaxSize().padding(paddingValues).background(Background)
        ) {
            if (question == null) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Primary)
                }
            } else {
                // Question content
                Column(
                    modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(16.dp)
                ) {
                    // Question header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "${currentIndex + 1}/${questions.size}",
                            style = MaterialTheme.typography.labelLarge,
                            color = OnSurfaceVariant
                        )
                        DifficultyChip(question.difficulty)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Question text
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape    = RoundedCornerShape(14.dp),
                        colors   = CardDefaults.cardColors(containerColor = Surface),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                question.questionText,
                                style      = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.Medium,
                                lineHeight = 24.sp
                            )
                            question.questionTextHindi?.let { hindi ->
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(hindi, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant, lineHeight = 22.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Options
                    question.options.forEach { opt ->
                        val isSelected = answers[question.id] == opt.id
                        OptionItem(
                            option     = opt,
                            isSelected = isSelected,
                            onSelect   = { viewModel.selectOption(question.id, opt.id) }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }

                // Action buttons row
                ActionRow(
                    questionId       = question.id,
                    hasAnswer        = answers[question.id] != null,
                    isReviewed       = question.id in reviewed,
                    isFirst          = currentIndex == 0,
                    isLast           = currentIndex == questions.size - 1,
                    onPrev           = { viewModel.prevQuestion() },
                    onNext           = { viewModel.nextQuestion() },
                    onClear          = { viewModel.clearAnswer(question.id) },
                    onToggleReview   = { viewModel.toggleReview(question.id) },
                    onSaveAndNext    = {
                        viewModel.nextQuestion()
                    }
                )
            }
        }

        // Question Palette (bottom sheet)
        if (showPalette) {
            ModalBottomSheet(
                onDismissRequest = { showPalette = false },
                containerColor   = Surface
            ) {
                QuestionPalette(
                    questions    = questions,
                    currentIndex = currentIndex,
                    viewModel    = viewModel,
                    onNavigate   = { idx ->
                        viewModel.goToQuestion(idx)
                        showPalette = false
                    }
                )
            }
        }

        // Submit Confirmation Dialog
        if (showConfirm) {
            SubmitConfirmDialog(
                answeredCount = answers.values.count { it != null },
                totalCount    = questions.size,
                onConfirm     = { showConfirm = false; viewModel.submitAttempt() },
                onDismiss     = { showConfirm = false }
            )
        }
    }
}

// ── Top bar with timer ────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestTopBar(
    title:          String,
    secondsLeft:    Long,
    timerColor:     Color,
    timerFormatted: String,
    onShowPalette:  () -> Unit,
    onSubmitClick:  () -> Unit
) {
    TopAppBar(
        title = {
            Column {
                Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold,
                    maxLines = 1)
            }
        },
        actions = {
            // Timer display — server se aata hai
            Card(
                shape  = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = timerColor.copy(alpha = 0.12f)
                )
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Outlined.Timer, contentDescription = "Timer", tint = timerColor, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(timerFormatted, style = MaterialTheme.typography.labelLarge, color = timerColor, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(modifier = Modifier.width(6.dp))
            IconButton(onClick = onShowPalette) {
                Icon(Icons.Outlined.GridView, contentDescription = "Palette", tint = Primary)
            }
            Button(
                onClick = onSubmitClick,
                colors  = ButtonDefaults.buttonColors(containerColor = Primary),
                modifier = Modifier.padding(end = 8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text("Submit", style = MaterialTheme.typography.labelMedium)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = Surface)
    )
}

// ── Option item ───────────────────────────────────────────────────────────────

@Composable
fun OptionItem(option: OptionDto, isSelected: Boolean, onSelect: () -> Unit) {
    val bgColor    = if (isSelected) PrimaryContainer else Surface
    val borderColor = if (isSelected) Primary else Color(0xFFE0E0E0)
    val textColor  = if (isSelected) Primary else OnBackground

    Card(
        modifier  = Modifier.fillMaxWidth().clickable(onClick = onSelect),
        shape     = RoundedCornerShape(12.dp),
        colors    = CardDefaults.cardColors(containerColor = bgColor),
        border    = BorderStroke(if (isSelected) 2.dp else 1.dp, borderColor),
        elevation = CardDefaults.cardElevation(if (isSelected) 3.dp else 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.Top
        ) {
            // Option number circle
            Box(
                modifier = Modifier.size(28.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(if (isSelected) Primary else Color(0xFFEEEEEE)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "${option.optionOrder}",
                    style      = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color      = if (isSelected) Color.White else OnSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(option.optionText, style = MaterialTheme.typography.bodyMedium, color = textColor)
                option.optionTextHindi?.let {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(it, style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
                }
            }
            if (isSelected) {
                Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
            }
        }
    }
}

// ── Action Row (Prev/Next/Clear/Review/Save&Next) ─────────────────────────────

@Composable
fun ActionRow(
    questionId:     Long,
    hasAnswer:      Boolean,
    isReviewed:     Boolean,
    isFirst:        Boolean,
    isLast:         Boolean,
    onPrev:         () -> Unit,
    onNext:         () -> Unit,
    onClear:        () -> Unit,
    onToggleReview: () -> Unit,
    onSaveAndNext:  () -> Unit
) {
    Column {
        Divider(color = Color(0xFFEEEEEE))
        Row(
            modifier = Modifier.fillMaxWidth().background(Surface).padding(horizontal = 12.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Previous
            OutlinedButton(
                onClick = onPrev, enabled = !isFirst,
                modifier = Modifier.height(40.dp),
                contentPadding = PaddingValues(horizontal = 10.dp)
            ) {
                Icon(Icons.Outlined.ChevronLeft, null, modifier = Modifier.size(18.dp))
                Text("Prev", style = MaterialTheme.typography.labelMedium)
            }

            // Clear
            OutlinedButton(
                onClick = onClear, enabled = hasAnswer,
                modifier = Modifier.height(40.dp),
                contentPadding = PaddingValues(horizontal = 10.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Error)
            ) {
                Icon(Icons.Outlined.Clear, null, modifier = Modifier.size(16.dp))
                Text("Clear", style = MaterialTheme.typography.labelMedium)
            }

            // Mark Review
            OutlinedButton(
                onClick = onToggleReview,
                modifier = Modifier.height(40.dp),
                contentPadding = PaddingValues(horizontal = 10.dp),
                colors = if (isReviewed)
                    ButtonDefaults.outlinedButtonColors(containerColor = Color(0xFFFFF3E0), contentColor = Warning)
                else ButtonDefaults.outlinedButtonColors()
            ) {
                Icon(if (isReviewed) Icons.Filled.Flag else Icons.Outlined.Flag, null, modifier = Modifier.size(16.dp))
                Text(if (isReviewed) "Flagged" else "Review", style = MaterialTheme.typography.labelMedium)
            }

            // Save & Next
            Button(
                onClick = onSaveAndNext, enabled = !isLast,
                modifier = Modifier.weight(1f).height(40.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = Primary)
            ) {
                Text("Save & Next", style = MaterialTheme.typography.labelMedium)
                Icon(Icons.Outlined.ChevronRight, null, modifier = Modifier.size(16.dp))
            }
        }
    }
}

// ── Question Palette ──────────────────────────────────────────────────────────

@Composable
fun QuestionPalette(
    questions:    List<QuestionSafeDto>,
    currentIndex: Int,
    viewModel:    TestViewModel,
    onNavigate:   (Int) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
        Text("Question Palette", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(12.dp))

        // Legend
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            listOf(
                "Answered"     to Success,
                "Flagged"      to Warning,
                "Visited"      to OnSurfaceVariant,
                "Not Visited"  to Color(0xFFEEEEEE)
            ).forEach { (label, color) ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(12.dp).clip(RoundedCornerShape(3.dp)).background(color))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(label, style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Grid of question numbers
        LazyVerticalGrid(
            columns = GridCells.Fixed(5),
            verticalArrangement   = Arrangement.spacedBy(8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.heightIn(max = 300.dp)
        ) {
            itemsIndexed(questions) { idx, q ->
                val state  = viewModel.getQuestionState(q.id)
                val isActive = idx == currentIndex

                val bgColor = when (state) {
                    TestViewModel.QState.ANSWERED            -> Success
                    TestViewModel.QState.ANSWERED_AND_MARKED -> Color(0xFF7B1FA2)  // purple
                    TestViewModel.QState.MARKED_FOR_REVIEW   -> Warning
                    TestViewModel.QState.VISITED             -> SurfaceVariant
                    TestViewModel.QState.NOT_VISITED         -> Color(0xFFEEEEEE)
                }
                val textColor = when (state) {
                    TestViewModel.QState.NOT_VISITED, TestViewModel.QState.VISITED -> OnBackground
                    else -> Color.White
                }

                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(bgColor)
                        .then(if (isActive) Modifier.border(2.dp, Primary, RoundedCornerShape(10.dp)) else Modifier)
                        .clickable { onNavigate(idx) },
                    contentAlignment = Alignment.Center
                ) {
                    Text("${idx + 1}", style = MaterialTheme.typography.labelLarge, color = textColor, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}

// ── Difficulty chip ───────────────────────────────────────────────────────────

@Composable
fun DifficultyChip(difficulty: String) {
    val (bg, fg) = when (difficulty.uppercase()) {
        "EASY"   -> Color(0xFFE8F5E9) to Success
        "HARD"   -> Color(0xFFFFEBEE) to Error
        else     -> Color(0xFFFFF8E1) to Warning
    }
    Box(
        modifier = Modifier.clip(RoundedCornerShape(20.dp)).background(bg).padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(difficulty.lowercase().replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.labelSmall, color = fg, fontWeight = FontWeight.Medium)
    }
}

// ── Submit confirmation dialog ────────────────────────────────────────────────

@Composable
fun SubmitConfirmDialog(
    answeredCount: Int,
    totalCount:    Int,
    onConfirm:     () -> Unit,
    onDismiss:     () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon    = { Icon(Icons.Outlined.Send, null, tint = Primary) },
        title   = { Text("Submit Test?", fontWeight = FontWeight.Bold) },
        text    = {
            Column {
                Text("$answeredCount / $totalCount questions answered")
                if (answeredCount < totalCount) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "${totalCount - answeredCount} questions unanswered hain.",
                        color = Warning,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text("Submit karne ke baad answers change nahi honge.", style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
            }
        },
        confirmButton = {
            Button(onClick = onConfirm, colors = ButtonDefaults.buttonColors(containerColor = Primary)) {
                Text("Submit")
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) { Text("Wapas Jao") }
        }
    )
}
