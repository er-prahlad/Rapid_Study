package com.rapidstudy.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class ExamPopularity {
    private Long   examId;
    private String examName;
    private long   attempts;
}
