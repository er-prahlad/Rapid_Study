package com.rapidstudy.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * A single leaderboard entry — no private user data exposed.
 *
 * Fields deliberately omitted for privacy:
 *   - email, phone, passwordHash, isActive, createdAt
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaderboardEntryDto implements Serializable {
    private int    rank;
    private Long   userId;
    private String name;
    private String profileImage;   // null-safe, only public avatar URL
    private double averageScore;   // average % across tests
    private double accuracy;       // correct / attempted * 100
    private int    testsCompleted;
    private boolean isCurrentUser; // set per-request — NOT cached
}
