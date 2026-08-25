package com.rapidstudy.dto.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class TopicRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Topic name is required")
    @Size(max = 100)
    private String name;

    private String  description;
    private Integer displayOrder = 0;
}
