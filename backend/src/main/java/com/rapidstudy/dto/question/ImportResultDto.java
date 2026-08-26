package com.rapidstudy.dto.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ImportResultDto {
    private int          totalRows;
    private int          imported;
    private int          failed;
    private int          duplicates;
    private List<String> errors;   // row-level error messages
}
