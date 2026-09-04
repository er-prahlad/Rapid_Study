package com.rapidstudy.dto.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TimeAnalysisDto {
    private int    totalDurationSeconds;   // test duration
    private int    timeTakenSeconds;       // actual time used
    private int    timeRemainingSeconds;   // leftover
    private double avgSecondsPerQuestion;  // timeTaken / totalQuestions
    private int    questionsAttempted;
    private int    questionsSkipped;
}
