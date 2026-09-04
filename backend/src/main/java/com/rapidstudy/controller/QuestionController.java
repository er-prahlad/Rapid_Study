package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.service.QuestionService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Student-facing practice question endpoints.
 * Returns safe DTOs — no correct answer information.
 *
 * GET /api/v1/practice/questions
 */
@RestController
@RequestMapping("/api/v1/practice")
@RequiredArgsConstructor
@Tag(name = "Practice", description = "Student practice question endpoints")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/questions")
    @Operation(summary = "Get practice questions (safe — no correct answers)")
    public ResponseEntity<ApiResponse<Page<QuestionSafeDto>>> practiceQuestions(
            @RequestParam(required = false) Long   topicId,
            @RequestParam(required = false) Long   subjectId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Difficulty diff = null;
        if (difficulty != null && !difficulty.isBlank()) {
            try { diff = Difficulty.valueOf(difficulty.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        Page<QuestionSafeDto> result = questionService.getPracticeQuestions(
                topicId, subjectId, diff,
                PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "id")));

        return ResponseEntity.ok(ApiResponse.success("Questions retrieved", result));
    }

    @GetMapping("/mistakes")
    @Operation(summary = "Get previously wrong questions (weak area / previous mistakes mode)")
    public ResponseEntity<ApiResponse<Page<QuestionSafeDto>>> previousMistakes(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = SecurityUtil.currentUserId();
        Page<QuestionSafeDto> result = questionService.getPreviousMistakes(
                userId, PageRequest.of(page, Math.min(size, 50)));
        return ResponseEntity.ok(ApiResponse.success("Previous mistakes retrieved", result));
    }
}
