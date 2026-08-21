# RapidStudy Android App

Native Android application built with Kotlin and Jetpack Compose.

## Prerequisites

- Android Studio Hedgehog or later
- Android SDK 34
- JDK 17 or later

## Getting Started

1. Open `android/` folder in Android Studio
2. Sync Gradle
3. Run on emulator or device

## Build

```powershell
cd android
.\gradlew.bat assembleDebug
```

APK location: `app/build/outputs/apk/debug/app-debug.apk`

## Tech Stack

- Kotlin
- Jetpack Compose
- MVVM Architecture
- Coroutines
- Retrofit + OkHttp
- Navigation Compose
- DataStore
- Material 3

## Project Structure

```
app/src/main/java/com/rapidstudy/
├── data/            # Data layer (API, models, repositories)
├── ui/              # UI layer (screens, components)
├── viewmodel/       # ViewModels
└── util/            # Utilities
```
