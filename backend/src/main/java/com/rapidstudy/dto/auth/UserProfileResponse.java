package com.rapidstudy.dto.auth;

import com.rapidstudy.enums.Language;
import com.rapidstudy.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for GET /api/v1/auth/me.
 * Never exposes passwordHash.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long          id;
    private String        name;
    private String        email;
    private String        phone;
    private String        profileImage;
    private Role          role;
    private Language      language;
    private Boolean       isActive;
    private LocalDateTime createdAt;
}
