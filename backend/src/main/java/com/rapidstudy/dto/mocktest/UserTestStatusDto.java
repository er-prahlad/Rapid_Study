package com.rapidstudy.dto.mocktest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTestStatusDto {
    private Long testId;
    private boolean attempted;
    private String status; // "NOT_STARTED", "IN_PROGRESS", "COMPLETED"
    private Long activeAttemptId; // ID of in-progress attempt to resume
    private Long lastAttemptId;   // ID of last attempt (e.g. for viewing result)
    private BigDecimal bestScore;
    private BigDecimal totalMarks;
    private Double bestAccuracy;
    private int totalAttemptsCount;
    private LocalDateTime lastAttemptedAt;
}
