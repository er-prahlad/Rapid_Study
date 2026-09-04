package com.rapidstudy.dto.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScoreHistoryDto {
    private Long          attemptId;
    private String        testTitle;
    private double        score;
    private double        totalMarks;
    private double        percentage;
    private double        accuracy;
    private LocalDateTime submittedAt;
}
