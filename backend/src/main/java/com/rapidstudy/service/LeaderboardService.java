package com.rapidstudy.service;

import com.rapidstudy.dto.leaderboard.LeaderboardEntryDto;
import com.rapidstudy.dto.leaderboard.LeaderboardResponse;
import com.rapidstudy.enums.AttemptStatus;
import com.rapidstudy.repository.TestAttemptRepository;
import com.rapidstudy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Leaderboard service — Phase 32.
 *
 * Queries are cached in Redis with period-specific TTLs.
 * Cache keys: leaderboard_daily, leaderboard_weekly, leaderboard_monthly, leaderboard_alltime
 *
 * The per-user `isCurrentUser` flag is applied AFTER retrieval (not cached)
 * so that the same cached list can be used for all users.
 *
 * Security: only name and profileImage are returned — no email, phone, or
 * any other private data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private static final int TOP_N = 50;

    private final TestAttemptRepository attemptRepository;
    private final UserRepository        userRepository;

    // ─────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────

    public LeaderboardResponse getLeaderboard(String period, Long currentUserId) {
        List<LeaderboardEntryDto> cached = fetchCached(period);

        // Mark current user — do this OUTSIDE the cache so it's per-request
        List<LeaderboardEntryDto> entries = cached.stream()
                .map(e -> LeaderboardEntryDto.builder()
                        .rank(e.getRank())
                        .userId(e.getUserId())
                        .name(e.getName())
                        .profileImage(e.getProfileImage())
                        .averageScore(e.getAverageScore())
                        .accuracy(e.getAccuracy())
                        .testsCompleted(e.getTestsCompleted())
                        .isCurrentUser(e.getUserId().equals(currentUserId))
                        .build())
                .collect(Collectors.toList());

        // Find current user's rank (may be outside top 50)
        Integer rank = entries.stream()
                .filter(LeaderboardEntryDto::isCurrentUser)
                .map(LeaderboardEntryDto::getRank)
                .findFirst().orElse(null);

        return LeaderboardResponse.builder()
                .period(period.toUpperCase())
                .entries(entries)
                .currentUserRank(rank)
                .fromCache(true)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Cached queries — one method per period so Spring Cache uses
    // different cache names with different TTLs
    // ─────────────────────────────────────────────────────────────────────

    private List<LeaderboardEntryDto> fetchCached(String period) {
        return switch (period.toUpperCase()) {
            case "DAILY"    -> getDaily();
            case "WEEKLY"   -> getWeekly();
            case "MONTHLY"  -> getMonthly();
            default         -> getAllTime();
        };
    }

    @Cacheable(value = "leaderboard_daily", key = "'top50'")
    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getDaily() {
        log.debug("Building daily leaderboard (cache miss)");
        return buildLeaderboard(LocalDateTime.now().minusDays(1));
    }

    @Cacheable(value = "leaderboard_weekly", key = "'top50'")
    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getWeekly() {
        log.debug("Building weekly leaderboard (cache miss)");
        return buildLeaderboard(LocalDateTime.now().minusWeeks(1));
    }

    @Cacheable(value = "leaderboard_monthly", key = "'top50'")
    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getMonthly() {
        log.debug("Building monthly leaderboard (cache miss)");
        return buildLeaderboard(LocalDateTime.now().minusMonths(1));
    }

    @Cacheable(value = "leaderboard_alltime", key = "'top50'")
    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getAllTime() {
        log.debug("Building all-time leaderboard (cache miss)");
        return buildLeaderboard(null);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Scheduled cache eviction — refresh leaderboard periodically
    // ─────────────────────────────────────────────────────────────────────

    /** Evict daily leaderboard every 5 minutes */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    @CacheEvict(value = "leaderboard_daily", key = "'top50'")
    public void evictDaily() { log.debug("Evicted daily leaderboard cache"); }

    /** Evict weekly leaderboard every 15 minutes */
    @Scheduled(fixedDelay = 15 * 60 * 1000)
    @CacheEvict(value = "leaderboard_weekly", key = "'top50'")
    public void evictWeekly() { log.debug("Evicted weekly leaderboard cache"); }

    /** Evict monthly leaderboard every 30 minutes */
    @Scheduled(fixedDelay = 30 * 60 * 1000)
    @CacheEvict(value = "leaderboard_monthly", key = "'top50'")
    public void evictMonthly() { log.debug("Evicted monthly leaderboard cache"); }

    /** Evict all-time leaderboard every 60 minutes */
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @CacheEvict(value = "leaderboard_alltime", key = "'top50'")
    public void evictAllTime() { log.debug("Evicted all-time leaderboard cache"); }

    // ─────────────────────────────────────────────────────────────────────
    // Core aggregation query
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Builds the leaderboard by aggregating all completed attempts.
     * Uses the existing JPQL query from TestAttemptRepository when
     * no date filter is applied, or a direct aggregation for filtered queries.
     *
     * Ranking criteria: highest average score percentage, then accuracy as tiebreaker.
     */
    private List<LeaderboardEntryDto> buildLeaderboard(LocalDateTime since) {
        // Use the existing top-users query for all-time (null since)
        // For filtered periods, we use a raw aggregation
        List<Object[]> rows;

        if (since == null) {
            rows = attemptRepository.findTopUsersByScore(PageRequest.of(0, TOP_N));
        } else {
            rows = attemptRepository.findTopUsersByScoreSince(since, PageRequest.of(0, TOP_N));
        }

        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int rank = 1;

        for (Object[] row : rows) {
            Long   userId  = ((Number) row[0]).longValue();
            String name    = (String) row[1];
            Double avgScore= row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            Double acc     = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
            Long   tests   = row[4] != null ? ((Number) row[4]).longValue()   : 0L;

            // Fetch only the public profile image — no other private fields
            String profileImage = userRepository.findById(userId)
                    .map(u -> u.getProfileImage()).orElse(null);

            entries.add(LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .userId(userId)
                    .name(name)
                    .profileImage(profileImage)
                    .averageScore(round(avgScore))
                    .accuracy(round(acc))
                    .testsCompleted(tests.intValue())
                    .isCurrentUser(false) // set per-request outside cache
                    .build());
        }

        return entries;
    }

    private double round(double v) { return Math.round(v * 100.0) / 100.0; }
}
