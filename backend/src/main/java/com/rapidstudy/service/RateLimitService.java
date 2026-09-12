package com.rapidstudy.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Phase 46 / Phase 56: Redis-backed rate limiting.
 *
 * Uses sliding window counter per user/IP per endpoint.
 * Fails open (allows request) if Redis is unavailable.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Check if the action is allowed within the rate limit.
     *
     * @param key       Unique key (e.g. "ai_explain:userId:123")
     * @param limit     Max requests allowed in the window
     * @param windowSec Window size in seconds
     * @return true if allowed, false if rate limited
     */
    public boolean isAllowed(String key, int limit, int windowSec) {
        try {
            String redisKey = "rate:" + key;
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSec));
            }
            boolean allowed = count == null || count <= limit;
            if (!allowed) {
                log.debug("Rate limit exceeded for key: {}", key);
            }
            return allowed;
        } catch (Exception e) {
            // Fail open — don't block requests if Redis is down
            log.warn("RateLimitService: Redis unavailable, allowing request. {}", e.getMessage());
            return true;
        }
    }

    /** Convenience: AI endpoints — 10 requests per minute per user */
    public boolean isAiAllowed(Long userId) {
        return isAllowed("ai:" + userId, 10, 60);
    }

    /** Auth endpoints — 20 requests per minute per IP */
    public boolean isAuthAllowed(String ip) {
        return isAllowed("auth:" + ip, 20, 60);
    }
}
