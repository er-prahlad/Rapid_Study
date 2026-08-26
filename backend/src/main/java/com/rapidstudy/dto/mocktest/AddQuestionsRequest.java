package com.rapidstudy.dto.mocktest;

import com.rapidstudy.enums.Difficulty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class AddQuestionsRequest {

    public enum SelectionMode { MANUAL, RANDOM, TOPIC_BASED, DIFFICULTY_BASED }

    @NotNull
    private SelectionMode mode = SelectionMode.MANUAL;

    /** MANUAL mode: list of question IDs */
    private List<Long> questionIds;

    /** RANDOM / TOPIC_BASED / DIFFICULTY_BASED modes */
    private Long       topicId;
    private Long       subjectId;
    private Difficulty difficulty;
    private Integer    count = 10;
}
