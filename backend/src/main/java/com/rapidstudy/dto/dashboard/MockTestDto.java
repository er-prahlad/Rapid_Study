package com.rapidstudy.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockTestDto {
    private Long   id;
    private String title;
    private int    durationMinutes;
    private int    totalQuestions;
    private double totalMarks;
    private double negativeMarks;
}
