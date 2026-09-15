package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Phase 73: Questions API endpoints.
 *
 * GET /api/questions
 * GET /api/questions/{id}
 * GET /api/v1/questions
 * GET /api/v1/questions/{id}
 */
@RestController
@RequestMapping({"/api/v1/questions", "/api/questions"})
@RequiredArgsConstructor
@Tag(name = "Questions", description = "Student question browsing (safe — without correct answers)")
public class PublicQuestionController {

    private final QuestionService questionService;

    @GetMapping
    @Operation(summary = "Get list of questions (safe — no correct answers)")
    public ResponseEntity<ApiResponse<Page<QuestionSafeDto>>> getQuestions(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Difficulty diff = null;
        if (difficulty != null && !difficulty.isBlank()) {
            try {
                diff = Difficulty.valueOf(difficulty.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Page<QuestionSafeDto> result = questionService.getPracticeQuestions(
                topicId, subjectId, diff,
                PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "id")));

        return ResponseEntity.ok(ApiResponse.success("Questions retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single question by id (safe — no correct answers)")
    public ResponseEntity<ApiResponse<QuestionSafeDto>> getQuestionById(@PathVariable Long id) {
        QuestionSafeDto question = questionService.getSafeById(id);
        return ResponseEntity.ok(ApiResponse.success("Question retrieved", question));
    }
}
