package com.rapidstudy.dto.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class OptionRequest {
    @NotBlank(message = "Option text is required")
    private String  optionText;
    private String  optionTextHindi;
    @NotNull(message = "Option order is required")
    private Integer optionOrder;
    @NotNull(message = "isCorrect is required")
    private Boolean isCorrect = false;
}
