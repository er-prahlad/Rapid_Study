package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.admin.AdminDashboardResponse;
import com.rapidstudy.dto.admin.AdminUserDto;
import com.rapidstudy.enums.Role;
import com.rapidstudy.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard and user management")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    // Phase 38
    @GetMapping("/dashboard")
    @Operation(summary = "Admin dashboard stats and charts")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard loaded", adminService.getDashboard()));
    }

    // Phase 39
    @GetMapping("/users")
    @Operation(summary = "List users with search/filter")
    public ResponseEntity<ApiResponse<Page<AdminUserDto>>> users(
            @RequestParam(required = false) String  search,
            @RequestParam(required = false) String  role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Role r = null;
        if (role != null && !role.isBlank()) {
            try { r = Role.valueOf(role.toUpperCase()); } catch (Exception ignored) {}
        }
        Page<AdminUserDto> result = adminService.getUsers(search, r, isActive,
                PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", result));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get a single user")
    public ResponseEntity<ApiResponse<AdminUserDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved", adminService.getUser(id)));
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Activate or deactivate a user")
    public ResponseEntity<ApiResponse<AdminUserDto>> setStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("isActive");
        if (active == null) throw new com.rapidstudy.exception.BadRequestException("isActive is required");
        return ResponseEntity.ok(ApiResponse.success("Status updated", adminService.setUserStatus(id, active)));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Change user role")
    public ResponseEntity<ApiResponse<AdminUserDto>> setRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String roleName = body.get("role");
        if (roleName == null) throw new com.rapidstudy.exception.BadRequestException("role is required");
        Role role;
        try { role = Role.valueOf(roleName.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new com.rapidstudy.exception.BadRequestException("Invalid role: " + roleName); }
        return ResponseEntity.ok(ApiResponse.success("Role updated", adminService.setUserRole(id, role)));
    }
}

