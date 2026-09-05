package com.rapidstudy.dto.admin;

import com.rapidstudy.enums.Language;
import com.rapidstudy.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Admin user view — never exposes passwordHash */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminUserDto {
    private Long          id;
    private String        name;
    private String        email;
    private String        phone;
    private String        profileImage;
    private Role          role;
    private Language      language;
    private Boolean       isActive;
    private LocalDateTime createdAt;
    private long          testsCompleted;
}
