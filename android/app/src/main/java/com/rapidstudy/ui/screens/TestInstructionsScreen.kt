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
import com.rapidstudy.data.model.MockTest
import com.rapidstudy.ui.theme.*

@Composable
fun TestInstructionsScreen(
    test:       MockTest?,
    isLoading:  Boolean,
    onStart:    () -> Unit,
    onBack:     () -> Unit
) {
    val instructions = listOf(
        "Har question dhyan se padho.",
        "MCQ mein sirf ek correct answer hoga.",
        "Timer server se control hota hai — client timer sirf display ke liye hai.",
        "Answer save hota hai automatically jab aap option select karte ho.",
        "Mark for Review se question flag kar sakte ho.",
        "Submit karne ke baad answers change nahi hote.",
        "Score server pe calculate hoti hai — client pe nahi.",
        "Test expire hone par auto-submit ho jaata hai."
    )

    Column(
        modifier = Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState())
    ) {
        // Green header
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(16.dp)
        ) {
            Column {
                IconButton(onClick = onBack) {
                    Icon(Icons.Outlined.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Spacer(modifier = Modifier.height(4.dp))
                test?.let {
                    Text(it.examName ?: "", style = MaterialTheme.typography.labelMedium,
                        color = Color.White.copy(alpha = 0.85f))
                    Text(it.title, style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold, color = Color.White)
                } ?: Text("Test Instructions", style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold, color = Color.White)
            }
        }

        // Stats row
        test?.let { t ->
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                InfoChip(Icons.Outlined.Quiz,  "${t.totalQuestions} Questions", Modifier.weight(1f))
                InfoChip(Icons.Outlined.EmojiEvents, "${t.totalMarks.toInt()} Marks",     Modifier.weight(1f))
                InfoChip(Icons.Outlined.Timer, "${t.durationMinutes} Min",   Modifier.weight(1f))
            }

            // Negative marking
            if (t.negativeMarks > 0) {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    colors   = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0)),
                    shape    = RoundedCornerShape(12.dp)
                ) {
                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Warning, contentDescription = null, tint = Warning)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Negative marking: -${t.negativeMarks} per wrong answer",
                            style = MaterialTheme.typography.bodySmall, color = Warning)
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
            }
        }

        // Marking scheme
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape    = RoundedCornerShape(16.dp),
            colors   = CardDefaults.cardColors(containerColor = Surface),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.Calculate, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Marking Scheme", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
                    MarkSchemeItem("✅ Correct",  "+${test?.totalMarks?.div(test.totalQuestions.toDouble())?.let { String.format("%.1f", it) } ?: "1"}", Success)
                    MarkSchemeItem("❌ Wrong",    "-${test?.negativeMarks ?: 0}",  Error)
                    MarkSchemeItem("⏭ Skipped",  "0",  OnSurfaceVariant)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Instructions list
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape    = RoundedCornerShape(16.dp),
            colors   = CardDefaults.cardColors(containerColor = Surface),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Instructions", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(10.dp))
                instructions.forEachIndexed { i, inst ->
                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                        Box(
                            modifier = Modifier.size(22.dp).clip(RoundedCornerShape(11.dp)).background(PrimaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("${i+1}", style = MaterialTheme.typography.labelSmall, color = Primary, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(inst, style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Start button
        Button(
            onClick   = onStart,
            enabled   = !isLoading && test != null,
            modifier  = Modifier.fillMaxWidth().height(54.dp).padding(horizontal = 16.dp),
            shape     = RoundedCornerShape(14.dp),
            colors    = ButtonDefaults.buttonColors(containerColor = Primary)
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
            } else {
                Icon(Icons.Outlined.PlayArrow, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Start Test", fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun InfoChip(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = PrimaryContainer)) {
        Column(modifier = Modifier.padding(10.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(label, style = MaterialTheme.typography.labelSmall, color = Primary, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
fun MarkSchemeItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = color)
        Text(label, style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant)
    }
}
