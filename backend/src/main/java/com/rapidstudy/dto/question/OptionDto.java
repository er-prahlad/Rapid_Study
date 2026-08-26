package com.rapidstudy.dto.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OptionDto {
    private Long    id;
    private String  optionText;
    private String  optionTextHindi;
    private Integer optionOrder;
    /** Only included in admin responses — never during active test */
    private Boolean isCorrect;
}
