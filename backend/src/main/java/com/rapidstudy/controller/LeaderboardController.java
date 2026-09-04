package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.leaderboard.LeaderboardResponse;
import com.rapidstudy.service.LeaderboardService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "Redis-cached leaderboard")
@SecurityRequirement(name = "bearerAuth")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    @Operation(summary = "Get leaderboard — period: DAILY/WEEKLY/MONTHLY/ALL_TIME")
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getLeaderboard(
            @RequestParam(defaultValue = "ALL_TIME") String period) {
        Long userId = SecurityUtil.currentUserId();
        LeaderboardResponse data = leaderboardService.getLeaderboard(period, userId);
        return ResponseEntity.ok(ApiResponse.success("Leaderboard retrieved", data));
    }
}
