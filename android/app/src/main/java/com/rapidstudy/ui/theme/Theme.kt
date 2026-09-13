package com.rapidstudy.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary           = Primary,
    onPrimary         = OnPrimary,
    primaryContainer  = PrimaryContainer,
    secondary         = Secondary,
    background        = Background,
    surface           = Surface,
    surfaceVariant    = SurfaceVariant,
    onBackground      = OnBackground,
    onSurface         = OnSurface,
    onSurfaceVariant  = OnSurfaceVariant,
    error             = Error,
)

@Composable
fun RapidStudyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // Abhi sirf light theme — dark mode future phase mein
    val colorScheme = LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography  = Typography,
        content     = content
    )
}
