package com.rapidstudy.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaderboardResponse {
    private String                    period;   // DAILY / WEEKLY / MONTHLY / ALL_TIME
    private List<LeaderboardEntryDto> entries;
    private Integer                   currentUserRank; // null if not in top 50
    private boolean                   fromCache;
}
