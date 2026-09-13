package com.rapidstudy.data.remote

import com.rapidstudy.data.local.TokenManager
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Phase 50: Auth interceptor — har request mein Bearer token add karta hai.
 * 401 aane par refresh token se new token leta hai.
 */
class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { tokenManager.getAccessToken() }

        val request = chain.request().newBuilder().apply {
            if (token != null) {
                header("Authorization", "Bearer $token")
            }
            header("Content-Type", "application/json")
            header("Accept", "application/json")
        }.build()

        val response = chain.proceed(request)

        // 401 aaya — token expired, logout karo
        if (response.code == 401) {
            runBlocking { tokenManager.clearTokens() }
        }

        return response
    }
}
