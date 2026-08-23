package com.rapidstudy.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTargetDto {
    private int questionsTarget;
    private int questionsDone;
    private int testsTarget;
    private int testsDone;
}
