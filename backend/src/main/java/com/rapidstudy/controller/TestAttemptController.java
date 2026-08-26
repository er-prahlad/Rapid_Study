package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.attempt.*;
import com.rapidstudy.service.TestAttemptService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Test Attempt REST endpoints — Phase 23, 24, 25.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SECURITY GUARANTEES                                             ║
 * ║  • All endpoints require authentication (JWT)                    ║
 * ║  • userId always extracted from JWT — never from request body    ║
 * ║  • Correct answers are NEVER returned by any endpoint here       ║
 * ║  • expiresAt is set by server on start — Phase 24                ║
 * ║  • Attempt ownership verified on every call                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * POST   /api/v1/tests/{testId}/attempts             — start attempt
 * GET    /api/v1/attempts/{id}                        — get status + palette
 * PUT    /api/v1/attempts/{id}/answers/{questionId}   — save answer
 * DELETE /api/v1/attempts/{id}/answers/{questionId}   — clear answer
 * PUT    /api/v1/attempts/{id}/questions/{questionId}/review   — mark review
 * DELETE /api/v1/attempts/{id}/questions/{questionId}/review  — unmark review
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Test Attempts", description = "Test attempt engine — start, navigate, save answers")
@SecurityRequirement(name = "bearerAuth")
public class TestAttemptController {

    private final TestAttemptService attemptService;

    // ── Start a new attempt (Phase 23) ────────────────────────────────

    @PostMapping("/api/v1/tests/{testId}/attempts")
    @Operation(
        summary = "Start a test attempt",
        description = "Creates a new attempt. expiresAt is server-controlled. " +
                      "Returns questions WITHOUT correct answers.")
    public ResponseEntity<ApiResponse<StartAttemptResponse>> startAttempt(
            @PathVariable Long testId) {

        Long userId = SecurityUtil.currentUserId();
        StartAttemptResponse response = attemptService.startAttempt(testId, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attempt started", response));
    }

    // ── Get attempt status + question palette (Phase 23 + 25) ─────────

    @GetMapping("/api/v1/attempts/{id}")
    @Operation(
        summary = "Get attempt status and question palette",
        description = "Returns remaining time (server-calculated) and question states " +
                      "for the palette. No correct answers included.")
    public ResponseEntity<ApiResponse<AttemptStatusResponse>> getAttemptStatus(
            @PathVariable Long id) {

        Long userId = SecurityUtil.currentUserId();
        AttemptStatusResponse response = attemptService.getAttemptStatus(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Attempt status", response));
    }

    // ── Save answer (Phase 25 + Phase 26) ────────────────────────────

    @PutMapping("/api/v1/attempts/{id}/answers/{questionId}")
    @Operation(
        summary = "Save or update an answer",
        description = "Accepts only selectedOptionId. Backend validates option belongs " +
                      "to the question. Does NOT accept score or isCorrect from client.")
    public ResponseEntity<ApiResponse<SaveAnswerResponse>> saveAnswer(
            @PathVariable Long id,
            @PathVariable Long questionId,
            @Valid @RequestBody SaveAnswerRequest request) {

        Long userId = SecurityUtil.currentUserId();
        SaveAnswerResponse response = attemptService.saveAnswer(id, questionId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Answer saved", response));
    }

    // ── Clear answer (Phase 25 + Phase 27) ───────────────────────────

    @DeleteMapping("/api/v1/attempts/{id}/answers/{questionId}")
    @Operation(summary = "Clear a saved answer")
    public ResponseEntity<ApiResponse<Void>> clearAnswer(
            @PathVariable Long id,
            @PathVariable Long questionId) {

        Long userId = SecurityUtil.currentUserId();
        attemptService.clearAnswer(id, questionId, userId);
        return ResponseEntity.ok(ApiResponse.success("Answer cleared", null));
    }

    // ── Mark for review (Phase 25 + Phase 27) ────────────────────────

    @PutMapping("/api/v1/attempts/{id}/questions/{questionId}/review")
    @Operation(summary = "Mark a question for review")
    public ResponseEntity<ApiResponse<QuestionStateDto>> markForReview(
            @PathVariable Long id,
            @PathVariable Long questionId) {

        Long userId = SecurityUtil.currentUserId();
        QuestionStateDto state = attemptService.toggleReview(id, questionId, true, userId);
        return ResponseEntity.ok(ApiResponse.success("Marked for review", state));
    }

    @DeleteMapping("/api/v1/attempts/{id}/questions/{questionId}/review")
    @Operation(summary = "Remove review mark from a question")
    public ResponseEntity<ApiResponse<QuestionStateDto>> unmarkReview(
            @PathVariable Long id,
            @PathVariable Long questionId) {

        Long userId = SecurityUtil.currentUserId();
        QuestionStateDto state = attemptService.toggleReview(id, questionId, false, userId);
        return ResponseEntity.ok(ApiResponse.success("Review mark removed", state));
    }
}
