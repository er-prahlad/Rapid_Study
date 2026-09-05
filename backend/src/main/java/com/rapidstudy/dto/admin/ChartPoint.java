package com.rapidstudy.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class ChartPoint {
    private String label; // e.g. "Mon", "2026-09-01"
    private long   value;
}
