package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.studyplan.StudyPlanDto;
import com.rapidstudy.dto.studyplan.StudyPlanRequest;
import com.rapidstudy.service.StudyPlanService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/study-plan")
@RequiredArgsConstructor
@Tag(name = "Study Plan", description = "Create and manage study plans")
@SecurityRequirement(name = "bearerAuth")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    @GetMapping
    @Operation(summary = "Get all study plans")
    public ResponseEntity<ApiResponse<List<StudyPlanDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Plans retrieved",
                studyPlanService.getPlans(SecurityUtil.currentUserId())));
    }

    @PostMapping
    @Operation(summary = "Create a study plan")
    public ResponseEntity<ApiResponse<StudyPlanDto>> create(@Valid @RequestBody StudyPlanRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Plan created",
                studyPlanService.createPlan(req, SecurityUtil.currentUserId())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a study plan")
    public ResponseEntity<ApiResponse<StudyPlanDto>> update(@PathVariable Long id,
            @Valid @RequestBody StudyPlanRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Plan updated",
                studyPlanService.updatePlan(id, req, SecurityUtil.currentUserId())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a study plan")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        studyPlanService.deletePlan(id, SecurityUtil.currentUserId());
        return ResponseEntity.ok(ApiResponse.success("Plan deleted", null));
    }
}
