package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.exam.*;
import com.rapidstudy.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin exam management endpoints.
 * All routes require ADMIN role (enforced by SecurityConfig + @PreAuthorize).
 *
 * POST   /api/v1/admin/exams              — create exam
 * GET    /api/v1/admin/exams              — list all exams (admin view)
 * PUT    /api/v1/admin/exams/{id}         — update exam
 * PATCH  /api/v1/admin/exams/{id}/status  — activate / deactivate
 *
 * POST   /api/v1/admin/subjects           — create subject
 * PUT    /api/v1/admin/subjects/{id}      — update subject
 * DELETE /api/v1/admin/subjects/{id}      — delete subject + its topics
 *
 * POST   /api/v1/admin/topics             — create topic
 * PUT    /api/v1/admin/topics/{id}        — update topic
 * DELETE /api/v1/admin/topics/{id}        — delete topic
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Exams", description = "Admin exam, subject and topic management")
@SecurityRequirement(name = "bearerAuth")
public class AdminExamController {

    private final ExamService examService;

    // ── Exams ──────────────────────────────────────────────────────────

    @GetMapping("/exams")
    @Operation(summary = "List all exams (admin view, all statuses)")
    public ResponseEntity<ApiResponse<Page<ExamDto>>> listExams(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ExamDto> result = examService.adminListExams(
                search, PageRequest.of(page, Math.min(size, 100), Sort.by("name")));
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved", result));
    }

    @PostMapping("/exams")
    @Operation(summary = "Create a new exam")
    public ResponseEntity<ApiResponse<ExamDto>> createExam(@Valid @RequestBody ExamRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exam created", examService.createExam(req)));
    }

    @PutMapping("/exams/{id}")
    @Operation(summary = "Update exam details")
    public ResponseEntity<ApiResponse<ExamDto>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody ExamRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Exam updated", examService.updateExam(id, req)));
    }

    @PatchMapping("/exams/{id}/deactivate")
    @Operation(summary = "Deactivate an exam (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deactivateExam(@PathVariable Long id) {
        examService.deactivateExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deactivated", null));
    }

    @PatchMapping("/exams/{id}/activate")
    @Operation(summary = "Re-activate a deactivated exam")
    public ResponseEntity<ApiResponse<Void>> activateExam(@PathVariable Long id) {
        examService.activateExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam activated", null));
    }

    // ── Subjects ───────────────────────────────────────────────────────

    @PostMapping("/subjects")
    @Operation(summary = "Create a subject for an exam")
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(@Valid @RequestBody SubjectRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created", examService.createSubject(req)));
    }

    @PutMapping("/subjects/{id}")
    @Operation(summary = "Update a subject")
    public ResponseEntity<ApiResponse<SubjectDto>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Subject updated", examService.updateSubject(id, req)));
    }

    @DeleteMapping("/subjects/{id}")
    @Operation(summary = "Delete a subject and all its topics")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        examService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted", null));
    }

    // ── Topics ─────────────────────────────────────────────────────────

    @PostMapping("/topics")
    @Operation(summary = "Create a topic for a subject")
    public ResponseEntity<ApiResponse<TopicDto>> createTopic(@Valid @RequestBody TopicRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Topic created", examService.createTopic(req)));
    }

    @PutMapping("/topics/{id}")
    @Operation(summary = "Update a topic")
    public ResponseEntity<ApiResponse<TopicDto>> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody TopicRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Topic updated", examService.updateTopic(id, req)));
    }

    @DeleteMapping("/topics/{id}")
    @Operation(summary = "Delete a topic")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long id) {
        examService.deleteTopic(id);
        return ResponseEntity.ok(ApiResponse.success("Topic deleted", null));
    }
}
