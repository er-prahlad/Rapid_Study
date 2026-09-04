package com.rapidstudy.dto.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DifficultyAnalysisDto {
    private String difficulty;   // EASY / MEDIUM / HARD
    private int    total;
    private int    correct;
    private int    wrong;
    private int    skipped;
    private double accuracy;
}
