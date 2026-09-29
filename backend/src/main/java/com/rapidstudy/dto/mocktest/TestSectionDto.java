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
public class TestSectionDto {
    private Long subjectId;
    private String sectionName;
    private Integer questionCount;
    private BigDecimal totalMarks;
    private List<Long> questionIds;
}
