plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
}

android {
    namespace = "com.rapidstudy"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.rapidstudy"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner =
            "androidx.test.runner.AndroidJUnitRunner"

        vectorDrawables {
            useSupportLibrary = true
        }

        // Physical mobile ke liye production API URL use karo.
        // Emulator ke liye 10.0.2.2 use hota hai.
        buildConfigField(
            "String",
            "API_BASE_URL",
             "\"https://rapidstudy-backend.onrender.com/api/v1/\""
        )
    }

    buildTypes {

        debug {
            isDebuggable = true
        }

        release {
            isMinifyEnabled = false

            proguardFiles(
                getDefaultProguardFile(
                    "proguard-android-optimize.txt"
                ),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {

    // ============================================================
    // CORE
    // ============================================================

    implementation("androidx.core:core-ktx:1.12.0")

    implementation(
        "androidx.lifecycle:lifecycle-runtime-ktx:2.7.0"
    )

    implementation(
        "androidx.activity:activity-compose:1.8.2"
    )


    // ============================================================
    // COMPOSE BOM
    // ============================================================

    implementation(
        platform(
            "androidx.compose:compose-bom:2024.09.03"
        )
    )

    androidTestImplementation(
        platform(
            "androidx.compose:compose-bom:2024.09.03"
        )
    )


    // ============================================================
    // COMPOSE UI
    // ============================================================

    implementation(
        "androidx.compose.ui:ui"
    )

    implementation(
        "androidx.compose.ui:ui-graphics"
    )

    implementation(
        "androidx.compose.ui:ui-tooling-preview"
    )

    implementation(
        "androidx.compose.material3:material3"
    )

    implementation(
        "androidx.compose.material:material-icons-extended"
    )


    // ============================================================
    // NAVIGATION
    // ============================================================

    implementation(
        "androidx.navigation:navigation-compose:2.7.6"
    )


    // ============================================================
    // VIEWMODEL
    // ============================================================

    implementation(
        "androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0"
    )

    implementation(
        "androidx.lifecycle:lifecycle-runtime-compose:2.7.0"
    )


    // ============================================================
    // COROUTINES
    // ============================================================

    implementation(
        "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
    )


    // ============================================================
    // RETROFIT
    // ============================================================

    implementation(
        "com.squareup.retrofit2:retrofit:2.9.0"
    )

    implementation(
        "com.squareup.retrofit2:converter-gson:2.9.0"
    )

    implementation(
        "com.squareup.okhttp3:okhttp:4.12.0"
    )

    implementation(
        "com.squareup.okhttp3:logging-interceptor:4.12.0"
    )


    // ============================================================
    // DATASTORE
    // ============================================================

    implementation(
        "androidx.datastore:datastore-preferences:1.0.0"
    )


    // ============================================================
    // COIL
    // ============================================================

    implementation(
        "io.coil-kt:coil-compose:2.5.0"
    )


    // ============================================================
    // SPLASH SCREEN
    // ============================================================

    implementation(
        "androidx.core:core-splashscreen:1.0.1"
    )


    // ============================================================
    // TESTING
    // ============================================================

    testImplementation(
        "junit:junit:4.13.2"
    )

    androidTestImplementation(
        "androidx.test.ext:junit:1.1.5"
    )

    androidTestImplementation(
        "androidx.test.espresso:espresso-core:3.5.1"
    )

    androidTestImplementation(
        "androidx.compose.ui:ui-test-junit4"
    )


    // ============================================================
    // DEBUG
    // ============================================================

    debugImplementation(
        "androidx.compose.ui:ui-tooling"
    )

    debugImplementation(
        "androidx.compose.ui:ui-test-manifest"
    )
}