package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.mocktest.AddQuestionsRequest;
import com.rapidstudy.dto.mocktest.MockTestDto;
import com.rapidstudy.dto.mocktest.MockTestRequest;
import com.rapidstudy.dto.question.QuestionDto;
import com.rapidstudy.service.MockTestService;
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

import java.util.List;

/**
 * Admin mock test management endpoints (Phase 20).
 *
 * GET    /api/v1/admin/tests                          — list all tests
 * POST   /api/v1/admin/tests                          — create test
 * PUT    /api/v1/admin/tests/{id}                     — update test
 * DELETE /api/v1/admin/tests/{id}                     — delete (draft only)
 * POST   /api/v1/admin/tests/{id}/publish             — publish
 * POST   /api/v1/admin/tests/{id}/unpublish           — unpublish
 * POST   /api/v1/admin/tests/{id}/questions           — add questions
 * DELETE /api/v1/admin/tests/{id}/questions/{qId}     — remove question
 * GET    /api/v1/admin/tests/{id}/questions           — list questions (with answers)
 */
@RestController
@RequestMapping("/api/v1/admin/tests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Tests", description = "Admin mock test builder")
@SecurityRequirement(name = "bearerAuth")
public class AdminMockTestController {

    private final MockTestService mockTestService;

    @GetMapping
    @Operation(summary = "List all tests (admin view)")
    public ResponseEntity<ApiResponse<Page<MockTestDto>>> list(
            @RequestParam(required = false) Long   examId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<MockTestDto> result = mockTestService.adminListTests(
                examId, search,
                PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success("Tests retrieved", result));
    }

    @PostMapping
    @Operation(summary = "Create a mock test (starts as unpublished)")
    public ResponseEntity<ApiResponse<MockTestDto>> create(@Valid @RequestBody MockTestRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test created", mockTestService.createTest(req)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update test details (must be unpublished)")
    public ResponseEntity<ApiResponse<MockTestDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody MockTestRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Test updated", mockTestService.updateTest(id, req)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a test (draft only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        mockTestService.deleteTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test deleted", null));
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish a test (must have questions)")
    public ResponseEntity<ApiResponse<MockTestDto>> publish(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Test published", mockTestService.publishTest(id)));
    }

    @PostMapping("/{id}/unpublish")
    @Operation(summary = "Unpublish a test")
    public ResponseEntity<ApiResponse<MockTestDto>> unpublish(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Test unpublished", mockTestService.unpublishTest(id)));
    }

    @PostMapping("/{id}/questions")
    @Operation(summary = "Add questions to a test (manual/random/topic/difficulty based)")
    public ResponseEntity<ApiResponse<MockTestDto>> addQuestions(
            @PathVariable Long id,
            @RequestBody AddQuestionsRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Questions added", mockTestService.addQuestions(id, req)));
    }

    @DeleteMapping("/{id}/questions/{questionId}")
    @Operation(summary = "Remove a question from a test")
    public ResponseEntity<ApiResponse<MockTestDto>> removeQuestion(
            @PathVariable Long id,
            @PathVariable Long questionId) {
        return ResponseEntity.ok(ApiResponse.success("Question removed", mockTestService.removeQuestion(id, questionId)));
    }

    @GetMapping("/{id}/questions")
    @Operation(summary = "List questions in a test (admin — includes correct answers)")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved", mockTestService.getAdminTestQuestions(id)));
    }
}
