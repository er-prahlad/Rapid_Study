package com.rapidstudy.dto.mocktest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestLeaderboardDto {
    private Long testId;
    private String testTitle;
    private BigDecimal totalMarks;
    private long totalParticipants;
    private BigDecimal highestScore;
    private BigDecimal averageScore;
    private Double averageAccuracy;

    // Current user's stats in this test (if logged in)
    private Integer myRank;
    private BigDecimal myScore;
    private Double myAccuracy;
    private Integer myTimeTakenSeconds;
    private Double myPercentile;

    // Top rankers list
    private List<TestRankEntryDto> rankings;
}
