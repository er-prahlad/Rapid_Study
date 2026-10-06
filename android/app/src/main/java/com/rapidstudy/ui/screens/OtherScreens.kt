package com.rapidstudy.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rapidstudy.ui.theme.*

/** Generic placeholder screen */
@Composable
fun PlaceholderScreen(title: String, icon: ImageVector, message: String) {
    Box(modifier = Modifier.fillMaxSize().background(Background), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
            Icon(icon, contentDescription = null, tint = Primary.copy(alpha = 0.4f), modifier = Modifier.size(64.dp))
            Spacer(modifier = Modifier.height(16.dp))
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(message, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
        }
    }
}

@Composable
fun BookmarksScreen() {
    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(16.dp)
        ) {
            Column {
                Text("Bookmarks", style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold, color = Color.White)
                Text("Saved questions", style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f))
            }
        }
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Outlined.Bookmarks, null, tint = Primary.copy(alpha = 0.3f), modifier = Modifier.size(64.dp))
                Spacer(modifier = Modifier.height(12.dp))
                Text("Koi bookmark nahi", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text("Practice karte waqt questions bookmark karo", style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
            }
        }
    }
}

@Composable
fun StudyPlanScreen() {
    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        Box(
            modifier = Modifier.fillMaxWidth()
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary)))
                .padding(16.dp)
        ) {
            Column {
                Text("Study Plan", style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold, color = Color.White)
                Text("Apni preparation plan karo", style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f))
            }
        }
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
                Icon(Icons.Outlined.CalendarMonth, null, tint = Primary.copy(alpha = 0.3f), modifier = Modifier.size(64.dp))
                Spacer(modifier = Modifier.height(12.dp))
                Text("Study Plan", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text("Apna exam target set karo aur daily plan banao", style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
                Spacer(modifier = Modifier.height(20.dp))
                Button(
                    onClick = {},
                    shape  = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Icon(Icons.Outlined.Add, null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("New Plan")
                }
            }
        }
    }
}
