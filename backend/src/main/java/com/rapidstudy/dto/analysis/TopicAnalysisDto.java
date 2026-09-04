package com.rapidstudy.dto.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TopicAnalysisDto {
    private String topicName;
    private String subjectName;
    private int    total;
    private int    correct;
    private int    wrong;
    private int    skipped;
    private double accuracy;
}
