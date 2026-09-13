package com.rapidstudy.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

// DataStore instance — app ke liye ek hi hoga
private val Context.dataStore by preferencesDataStore(name = "rapidstudy_prefs")

/**
 * Phase 50: Token storage using DataStore.
 * SharedPreferences se zyada secure aur async-friendly.
 */
class TokenManager(private val context: Context) {

    companion object {
        private val ACCESS_TOKEN   = stringPreferencesKey("access_token")
        private val REFRESH_TOKEN  = stringPreferencesKey("refresh_token")
        private val USER_ID        = stringPreferencesKey("user_id")
        private val USER_NAME      = stringPreferencesKey("user_name")
        private val USER_EMAIL     = stringPreferencesKey("user_email")
        private val USER_ROLE      = stringPreferencesKey("user_role")
    }

    val accessToken: Flow<String?> = context.dataStore.data.map { it[ACCESS_TOKEN] }
    val userId: Flow<String?>      = context.dataStore.data.map { it[USER_ID] }
    val userName: Flow<String?>    = context.dataStore.data.map { it[USER_NAME] }
    val userRole: Flow<String?>    = context.dataStore.data.map { it[USER_ROLE] }

    suspend fun saveTokens(
        accessToken: String,
        refreshToken: String,
        userId: Long,
        name: String,
        email: String,
        role: String
    ) {
        context.dataStore.edit { prefs ->
            prefs[ACCESS_TOKEN]  = accessToken
            prefs[REFRESH_TOKEN] = refreshToken
            prefs[USER_ID]       = userId.toString()
            prefs[USER_NAME]     = name
            prefs[USER_EMAIL]    = email
            prefs[USER_ROLE]     = role
        }
    }

    suspend fun clearTokens() {
        context.dataStore.edit { it.clear() }
    }

    suspend fun getAccessToken(): String? =
        context.dataStore.data.map { it[ACCESS_TOKEN] }.first()

    suspend fun getRefreshToken(): String? =
        context.dataStore.data.map { it[REFRESH_TOKEN] }.first()

    suspend fun isLoggedIn(): Boolean = getAccessToken() != null
}
