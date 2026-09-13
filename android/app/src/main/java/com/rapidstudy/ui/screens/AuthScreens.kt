package com.rapidstudy.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rapidstudy.ui.theme.*

@Composable
fun LoginScreen(
    onLogin:       (email: String, password: String) -> Unit,
    onGoRegister:  () -> Unit,
    isLoading:     Boolean,
    errorMessage:  String?
) {
    var email    by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPwd  by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState())
    ) {
        // Green header
        Box(
            modifier = Modifier.fillMaxWidth().height(220.dp)
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary))),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier.size(60.dp).clip(RoundedCornerShape(16.dp)).background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Text("R", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Primary)
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text("RapidStudy", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Prepare • Practice • Perform", style = MaterialTheme.typography.bodySmall, color = Color.White.copy(alpha = 0.8f))
            }
        }

        // Form card
        Card(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            shape    = RoundedCornerShape(20.dp),
            colors   = CardDefaults.cardColors(containerColor = Surface),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Sign In", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Apne account mein sign in karo", style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
                Spacer(modifier = Modifier.height(20.dp))

                OutlinedTextField(
                    value         = email,
                    onValueChange = { email = it },
                    label         = { Text("Email") },
                    leadingIcon   = { Icon(Icons.Outlined.Email, null, tint = Primary) },
                    modifier      = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    singleLine    = true,
                    colors        = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, focusedLabelColor = Primary)
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value         = password,
                    onValueChange = { password = it },
                    label         = { Text("Password") },
                    leadingIcon   = { Icon(Icons.Outlined.Lock, null, tint = Primary) },
                    trailingIcon  = {
                        IconButton(onClick = { showPwd = !showPwd }) {
                            Icon(if (showPwd) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility, null)
                        }
                    },
                    visualTransformation = if (showPwd) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier      = Modifier.fillMaxWidth(),
                    singleLine    = true,
                    colors        = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, focusedLabelColor = Primary)
                )

                errorMessage?.let {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick   = { onLogin(email.trim(), password) },
                    modifier  = Modifier.fillMaxWidth().height(50.dp),
                    enabled   = email.isNotBlank() && password.isNotBlank() && !isLoading,
                    shape     = RoundedCornerShape(12.dp),
                    colors    = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    if (isLoading) CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                    else Text("Sign In", fontWeight = FontWeight.SemiBold)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                    Text("Account nahi hai? ", color = OnSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
                    Text("Register karo", color = Primary, fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable(onClick = onGoRegister),
                        style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

@Composable
fun RegisterScreen(
    onRegister:   (name: String, email: String, password: String, phone: String?) -> Unit,
    onGoLogin:    () -> Unit,
    isLoading:    Boolean,
    errorMessage: String?
) {
    var name     by remember { mutableStateOf("") }
    var email    by remember { mutableStateOf("") }
    var phone    by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPwd  by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState())) {
        // Green top bar
        Box(
            modifier = Modifier.fillMaxWidth().height(140.dp)
                .background(Brush.verticalGradient(listOf(PrimaryLight, Primary))),
            contentAlignment = Alignment.Center
        ) {
            Text("Create Account", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = Color.White)
        }

        Card(
            modifier  = Modifier.fillMaxWidth().padding(16.dp),
            shape     = RoundedCornerShape(20.dp),
            colors    = CardDefaults.cardColors(containerColor = Surface),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Register", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("RapidStudy join karo", style = MaterialTheme.typography.bodySmall, color = OnSurfaceVariant)
                Spacer(modifier = Modifier.height(16.dp))

                listOf(
                    Triple("Full Name", Icons.Outlined.Person, name) to { v: String -> name = v },
                    Triple("Email", Icons.Outlined.Email, email) to { v: String -> email = v },
                    Triple("Phone (optional)", Icons.Outlined.Phone, phone) to { v: String -> phone = v },
                ).forEach { (fieldData, onValueChange) ->
                    val (label, icon, value) = fieldData
                    OutlinedTextField(
                        value = value, onValueChange = onValueChange,
                        label = { Text(label) },
                        leadingIcon = { Icon(icon, null, tint = Primary) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, focusedLabelColor = Primary),
                        keyboardOptions = when (label) {
                            "Email" -> KeyboardOptions(keyboardType = KeyboardType.Email)
                            "Phone (optional)" -> KeyboardOptions(keyboardType = KeyboardType.Phone)
                            else -> KeyboardOptions.Default
                        }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                }

                OutlinedTextField(
                    value = password, onValueChange = { password = it },
                    label = { Text("Password") },
                    leadingIcon = { Icon(Icons.Outlined.Lock, null, tint = Primary) },
                    trailingIcon = {
                        IconButton(onClick = { showPwd = !showPwd }) {
                            Icon(if (showPwd) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility, null)
                        }
                    },
                    visualTransformation = if (showPwd) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(), singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, focusedLabelColor = Primary)
                )

                errorMessage?.let {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick  = { onRegister(name.trim(), email.trim(), password, phone.ifBlank { null }) },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    enabled  = name.isNotBlank() && email.isNotBlank() && password.length >= 8 && !isLoading,
                    shape    = RoundedCornerShape(12.dp),
                    colors   = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    if (isLoading) CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                    else Text("Create Account", fontWeight = FontWeight.SemiBold)
                }

                Spacer(modifier = Modifier.height(16.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                    Text("Pehle se account hai? ", color = OnSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
                    Text("Sign In", color = Primary, fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable(onClick = onGoLogin),
                        style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
