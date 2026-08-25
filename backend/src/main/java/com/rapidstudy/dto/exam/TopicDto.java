package com.rapidstudy.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TopicDto {
    private Long   id;
    private Long   subjectId;
    private String name;
    private String description;
    private int    displayOrder;
}
