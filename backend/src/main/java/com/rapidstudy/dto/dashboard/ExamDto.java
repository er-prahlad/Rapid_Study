package com.rapidstudy.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDto {
    private Long    id;
    private String  name;
    private String  code;
    private String  description;
    private String  logo;
    private boolean isActive;
}
