package com.rapidstudy.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {
    private int     rank;
    private Long    userId;
    private String  name;
    private String  profileImage;
    private double  score;
    private double  accuracy;
    private int     tests;
    private boolean isCurrentUser;
}
