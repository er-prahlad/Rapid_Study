package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.mocktest.MockTestDto;
import com.rapidstudy.dto.mocktest.TestLeaderboardDto;
import com.rapidstudy.dto.mocktest.TestSectionDto;
import com.rapidstudy.dto.mocktest.UserTestStatusDto;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.entity.MockTest;
import com.rapidstudy.repository.MockTestRepository;
import com.rapidstudy.service.MockTestService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Student-facing mock test endpoints.
 *
 * GET /api/v1/tests                     — published tests (Phase 21)
 * GET /api/v1/tests/{id}                — test details (Phase 22)
 * GET /api/v1/tests/{id}/questions      — safe questions (Phase 23 — no answers)
 * GET /api/v1/tests/{id}/leaderboard    — test-specific rank list and percentile
 * GET /api/v1/tests/{id}/my-status      — student attempt status (Resume / Best Score)
 * GET /api/v1/tests/my-status           — all attempt statuses for student
 * GET /api/v1/tests/{id}/sections       — section-wise / subject breakdown
 * GET /api/v1/tests/live                — all-India live and scheduled tests
 */
@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
@Tag(name = "Tests", description = "Student mock test listing and instructions")
public class MockTestController {

    private final MockTestService    mockTestService;
    private final MockTestRepository mockTestRepository;

    @GetMapping
    @Operation(summary = "List all published mock tests with optional exam filter")
    public ResponseEntity<ApiResponse<Page<MockTestDto>>> listTests(
            @RequestParam(required = false) Long   examId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<MockTestDto> result = mockTestService.getPublishedTests(
                examId, search,
                PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success("Tests retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single published test (for instructions page)")
    public ResponseEntity<ApiResponse<MockTestDto>> getTest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Test retrieved", mockTestService.getPublishedById(id)));
    }

    @GetMapping("/{id}/questions")
    @Operation(summary = "Get questions for a test (safe — no correct answers)")
    public ResponseEntity<ApiResponse<List<QuestionSafeDto>>> getTestQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved", mockTestService.getTestQuestions(id)));
    }

    @GetMapping("/previous-year")
    @Operation(summary = "Get previous year papers — filter by examId and/or year")
    public ResponseEntity<ApiResponse<Page<MockTestDto>>> getPreviousYearPapers(
            @RequestParam(required = false) Long   examId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MockTestDto> filtered = mockTestRepository.findByIsPublishedTrueAndPaperType(
                "PREVIOUS_YEAR", PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))).map(mockTestService::toDto);
        return ResponseEntity.ok(ApiResponse.success("Previous year papers retrieved", filtered));
    }

    // ──────────────────────────────────────────────────────────────────
    // 🏆 1. Test-Specific Leaderboard & Percentile
    // ──────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/leaderboard")
    @Operation(summary = "Get leaderboard, top rankers, and student's percentile for this specific test")
    public ResponseEntity<ApiResponse<TestLeaderboardDto>> getTestLeaderboard(@PathVariable Long id) {
        Long currentUserId = SecurityUtil.optionalUserId();
        TestLeaderboardDto result = mockTestService.getTestLeaderboard(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Test leaderboard retrieved", result));
    }

    // ──────────────────────────────────────────────────────────────────
    // 📊 2. Student Attempt Status on Test Cards
    // ──────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/my-status")
    @Operation(summary = "Get student attempt status for a single test (Resume / Best Score / In Progress)")
    public ResponseEntity<ApiResponse<UserTestStatusDto>> getMyTestStatus(@PathVariable Long id) {
        Long currentUserId = SecurityUtil.optionalUserId();
        UserTestStatusDto status = mockTestService.getUserTestStatus(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Attempt status retrieved", status));
    }

    @GetMapping("/my-status")
    @Operation(summary = "Get student attempt statuses for all tests (bulk status for test cards)")
    public ResponseEntity<ApiResponse<Map<Long, UserTestStatusDto>>> getAllMyTestStatuses() {
        Long currentUserId = SecurityUtil.optionalUserId();
        Map<Long, UserTestStatusDto> statuses = mockTestService.getAllUserTestStatuses(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User test statuses retrieved", statuses));
    }

    // ──────────────────────────────────────────────────────────────────
    // 🔴 3. All-India Live / Scheduled Mock Tests
    // ──────────────────────────────────────────────────────────────────

    @GetMapping("/live")
    @Operation(summary = "Get live and scheduled upcoming mock tests")
    public ResponseEntity<ApiResponse<List<MockTestDto>>> getLiveTests() {
        List<MockTestDto> allTests = mockTestRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .filter(MockTest::getIsPublished)
                .map(mockTestService::toDto)
                .filter(t -> "LIVE".equals(t.getLiveStatus()) || "UPCOMING".equals(t.getLiveStatus()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Live tests retrieved", allTests));
    }

    // ──────────────────────────────────────────────────────────────────
    // 📑 4. Section-wise / Subject-wise Test Breakdown
    // ──────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/sections")
    @Operation(summary = "Get section-wise and subject breakdown for a test")
    public ResponseEntity<ApiResponse<List<TestSectionDto>>> getTestSections(@PathVariable Long id) {
        List<TestSectionDto> sections = mockTestService.getTestSections(id);
        return ResponseEntity.ok(ApiResponse.success("Test sections retrieved", sections));
    }
}
