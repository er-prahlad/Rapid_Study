package com.rapidstudy.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import com.rapidstudy.ui.theme.*

@Composable
fun SplashScreen(onComplete: () -> Unit) {
    var visible by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        delay(300)
        visible = true
        delay(1800)
        onComplete()
    }

    Box(
        modifier = Modifier.fillMaxSize()
            .background(Brush.verticalGradient(listOf(PrimaryLight, PrimaryDark))),
        contentAlignment = Alignment.Center
    ) {
        AnimatedVisibility(
            visible = visible,
            enter   = fadeIn() + scaleIn(initialScale = 0.8f),
            exit    = fadeOut()
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // App icon
                Box(
                    modifier = Modifier.size(80.dp).clip(RoundedCornerShape(22.dp)).background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Text("R", fontSize = 40.sp, fontWeight = FontWeight.Bold, color = Primary)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "RapidStudy",
                    style      = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color      = Color.White
                )
                Text(
                    "Prepare • Practice • Perform",
                    style  = MaterialTheme.typography.bodyMedium,
                    color  = Color.White.copy(alpha = 0.85f)
                )

                Spacer(modifier = Modifier.height(40.dp))

                CircularProgressIndicator(
                    color     = Color.White.copy(alpha = 0.7f),
                    modifier  = Modifier.size(28.dp),
                    strokeWidth = 2.dp
                )
            }
        }
    }
}
