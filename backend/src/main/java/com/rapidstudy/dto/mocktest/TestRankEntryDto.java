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
public class TestRankEntryDto {
    private int rank;
    private Long userId;
    private String userName;
    private String profileImage;
    private BigDecimal score;
    private BigDecimal totalMarks;
    private Double accuracy;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer timeTakenSeconds;
    private LocalDateTime completedAt;
}
