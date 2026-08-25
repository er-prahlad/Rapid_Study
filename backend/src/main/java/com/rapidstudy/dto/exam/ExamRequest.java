package com.rapidstudy.dto.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request body for creating / updating an exam (admin only) */
@Data @NoArgsConstructor @AllArgsConstructor
public class ExamRequest {

    @NotBlank(message = "Exam name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Exam code is required")
    @Size(max = 50)
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "Code must be uppercase letters, digits or underscores")
    private String code;

    private String description;
    private String logo;
    private Boolean isActive = true;
}
