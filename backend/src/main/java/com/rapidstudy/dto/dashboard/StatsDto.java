package com.rapidstudy.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsDto {
    private long   testsAttempted;
    private double averageScore;
    private int    currentStreak;
    private long   totalQuestions;
    private double accuracy;
    private int    rank;
}
