package com.rapidstudy.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentAttemptDto {
    private Long          id;
    private String        testTitle;
    private double        score;
    private double        totalMarks;
    private double        accuracy;
    private LocalDateTime submittedAt;
}
