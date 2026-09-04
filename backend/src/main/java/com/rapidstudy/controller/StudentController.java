package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.analysis.PerformanceResponse;
import com.rapidstudy.dto.dashboard.DashboardResponse;
import com.rapidstudy.service.AnalysisService;
import com.rapidstudy.service.StudentService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Student-facing endpoints.
 *
 * GET /api/v1/student/dashboard    — dashboard data  (Phase 15)
 * GET /api/v1/student/performance  — performance stats (Phase 31)
 */
@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
@Tag(name = "Student", description = "Student dashboard and performance endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService  studentService;
    private final AnalysisService analysisService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get student dashboard data")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        Long userId = SecurityUtil.currentUserId();
        DashboardResponse data = studentService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard loaded", data));
    }

    @GetMapping("/performance")
    @Operation(summary = "Get overall performance statistics and history")
    public ResponseEntity<ApiResponse<PerformanceResponse>> getPerformance() {
        Long userId = SecurityUtil.currentUserId();
        PerformanceResponse data = analysisService.getPerformance(userId);
        return ResponseEntity.ok(ApiResponse.success("Performance retrieved", data));
    }
}
