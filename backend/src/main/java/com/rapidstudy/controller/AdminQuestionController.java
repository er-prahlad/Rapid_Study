package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.question.*;
import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin question management endpoints.
 *
 * GET    /api/v1/admin/questions               — list with filters
 * GET    /api/v1/admin/questions/{id}          — single question
 * POST   /api/v1/admin/questions               — create
 * PUT    /api/v1/admin/questions/{id}          — update
 * PATCH  /api/v1/admin/questions/{id}/activate
 * PATCH  /api/v1/admin/questions/{id}/deactivate
 * POST   /api/v1/admin/questions/import        — CSV/XLSX import
 */
@RestController
@RequestMapping("/api/v1/admin/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Questions", description = "Admin question bank management")
@SecurityRequirement(name = "bearerAuth")
public class AdminQuestionController {

    private final QuestionService questionService;

    @GetMapping
    @Operation(summary = "List questions with filters (admin — includes correct answers)")
    public ResponseEntity<ApiResponse<Page<QuestionDto>>> list(
            @RequestParam(required = false) Long   topicId,
            @RequestParam(required = false) Long   subjectId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Difficulty diff = parseDifficulty(difficulty);
        Page<QuestionDto> result = questionService.getQuestions(
                topicId, subjectId, diff, isActive, search,
                PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "id")));
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single question with correct answers")
    public ResponseEntity<ApiResponse<QuestionDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Question retrieved", questionService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a question")
    public ResponseEntity<ApiResponse<QuestionDto>> create(@Valid @RequestBody QuestionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created", questionService.createQuestion(req)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a question")
    public ResponseEntity<ApiResponse<QuestionDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Question updated", questionService.updateQuestion(id, req)));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a question")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        questionService.deactivateQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deactivated", null));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a question")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable Long id) {
        questionService.activateQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question activated", null));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import questions from CSV or XLSX file")
    public ResponseEntity<ApiResponse<ImportResultDto>> importFile(
            @RequestParam("file") MultipartFile file) {
        ImportResultDto result = questionService.importQuestions(file);
        return ResponseEntity.ok(ApiResponse.success("Import complete", result));
    }

    private Difficulty parseDifficulty(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Difficulty.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }
}
