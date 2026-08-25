package com.rapidstudy.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubjectDto {
    private Long         id;
    private Long         examId;
    private String       name;
    private String       description;
    private int          displayOrder;
    private List<TopicDto> topics;   // null when not requested
}
