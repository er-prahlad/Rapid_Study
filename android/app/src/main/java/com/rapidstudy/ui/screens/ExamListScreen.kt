package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.rapidstudy.data.model.Exam
import com.rapidstudy.ui.navigation.Screen
import com.rapidstudy.ui.theme.*
import com.rapidstudy.ui.viewmodel.ExamViewModel
import com.rapidstudy.ui.viewmodel.UiState

@Composable
fun ExamListScreen(navController: NavController, viewModel: ExamViewModel) {
    val examsState by viewModel.exams.collectAsStateWithLifecycle()
    var searchText by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        // Header
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(16.dp)
        ) {
            Column {
                Text("Exams", style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold, color = Color.White)
                Text("Apna exam choose karo", style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f))
                Spacer(modifier = Modifier.height(12.dp))
                // Search bar
                OutlinedTextField(
                    value         = searchText,
                    onValueChange = { searchText = it },
                    placeholder   = { Text("Search exams…", color = Color.White.copy(alpha = 0.6f)) },
                    leadingIcon   = { Icon(Icons.Outlined.Search, null, tint = Color.White.copy(alpha = 0.7f)) },
                    trailingIcon  = {
                        if (searchText.isNotBlank())
                            IconButton(onClick = { searchText = ""; viewModel.load("") }) {
                                Icon(Icons.Outlined.Clear, null, tint = Color.White.copy(alpha = 0.7f))
                            }
                    },
                    modifier      = Modifier.fillMaxWidth(),
                    singleLine    = true,
                    colors        = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor   = Color.White.copy(alpha = 0.7f),
                        unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
                        focusedTextColor     = Color.White,
                        unfocusedTextColor   = Color.White,
                        cursorColor          = Color.White
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = { viewModel.load(searchText) })
                )
            }
        }

        when (val state = examsState) {
            is UiState.Loading -> LoadingGrid()
            is UiState.Error   -> ErrorMessage(state.message) { viewModel.load() }
            is UiState.Success -> {
                val exams = state.data.content
                if (exams.isEmpty()) {
                    EmptyState("Koi exam nahi mila", "Dusre keywords se search karo")
                } else {
                    LazyColumn(
                        contentPadding      = PaddingValues(12.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(exams) { exam ->
                            ExamCard(exam = exam, onClick = {
                                navController.navigate(Screen.ExamDetail.createRoute(exam.id))
                            })
                        }
                    }
                }
            }
        }
    }
}

val EXAM_GRADIENT = mapOf(
    "SSC_CGL"  to listOf(Color(0xFF1565C0), Color(0xFF0D47A1)),
    "SSC_CHSL" to listOf(Color(0xFF283593), Color(0xFF1A237E)),
    "UPSC_CSE" to listOf(Color(0xFF6A1B9A), Color(0xFF4A148C)),
    "BPSC"     to listOf(Color(0xFF2E7D32), Color(0xFF1B5E20)),
    "RAILWAY"  to listOf(Color(0xFFE65100), Color(0xFFBF360C)),
    "BANK_PO"  to listOf(Color(0xFF00695C), Color(0xFF004D40)),
)

@Composable
fun ExamCard(exam: Exam, onClick: () -> Unit) {
    val gradient = EXAM_GRADIENT[exam.code]
        ?: listOf(Primary, PrimaryDark)

    Card(
        modifier  = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape     = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            // Color accent bar
            Box(
                modifier = Modifier.width(8.dp).height(80.dp)
                    .background(Brush.verticalGradient(gradient))
            )
            Column(modifier = Modifier.weight(1f).padding(14.dp)) {
                Text(exam.name, style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold)
                exam.description?.let {
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(it, style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant,
                        maxLines = 2)
                }
            }
            Icon(Icons.Outlined.ChevronRight, null, tint = Primary.copy(alpha = 0.6f),
                modifier = Modifier.align(Alignment.CenterVertically).padding(end = 12.dp))
        }
    }
}
