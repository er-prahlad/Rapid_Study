package com.rapidstudy.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** Full exam details including subjects with their topics */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExamDetailDto {
    private Long             id;
    private String           name;
    private String           code;
    private String           description;
    private String           logo;
    private boolean          isActive;
    private int              totalSubjects;
    private int              totalTests;
    private LocalDateTime    createdAt;
    private List<SubjectDto> subjects;
}
