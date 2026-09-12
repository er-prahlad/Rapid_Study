package com.rapidstudy.controller;

import com.rapidstudy.ai.AIService;
import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.service.AnalysisService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Phase 45-48: AI endpoints.
 *
 * All endpoints degrade gracefully when AI is disabled —
 * they return rule-based fallback responses, not errors.
 *
 * POST /api/v1/ai/explain                — explain a question
 * POST /api/v1/ai/analyze-performance    — AI performance analysis
 * POST /api/v1/ai/generate-study-plan    — personalized study plan
 * POST /api/v1/ai/personalized-test      — test recommendations
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI-powered features (optional — degrades gracefully)")
@SecurityRequirement(name = "bearerAuth")
public class AIController {

    private final AIService      aiService;
    private final AnalysisService analysisService;

    @PostMapping("/explain")
    @Operation(summary = "Explain a question (AI or rule-based fallback)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> explain(
            @RequestBody Map<String, Object> body) {

        Long   qId  = body.containsKey("questionId") ? Long.valueOf(body.get("questionId").toString()) : 0L;
        String text = (String) body.getOrDefault("questionText", "");
        String ans  = (String) body.getOrDefault("correctAnswer", "");

        String explanation = aiService.explainQuestion(qId, text, ans);
        return ResponseEntity.ok(ApiResponse.success("Explanation", Map.of(
                "explanation", explanation,
                "aiUsed",      aiService.isAvailable())));
    }

    @PostMapping("/analyze-performance")
    @Operation(summary = "AI performance analysis for current user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzePerformance() {
        Long userId = SecurityUtil.currentUserId();
        var perf    = analysisService.getPerformance(userId);

        String weakSubject = perf.getSubjectPerformance().stream()
                .min((a, b) -> Double.compare(a.getAccuracy(), b.getAccuracy()))
                .map(s -> s.getSubjectName()).orElse("Unknown");

        String analysis = aiService.analyzePerformance(
                perf.getAverageAccuracy(), perf.getAverageScore(),
                weakSubject, (int) perf.getTestsCompleted());

        return ResponseEntity.ok(ApiResponse.success("Analysis", Map.of(
                "analysis", analysis,
                "aiUsed",   aiService.isAvailable())));
    }

    @PostMapping("/generate-study-plan")
    @Operation(summary = "Generate a personalized study plan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateStudyPlan(
            @RequestBody Map<String, Object> body) {

        String examName    = (String) body.getOrDefault("examName", "Competitive Exam");
        int    daysLeft    = Integer.parseInt(body.getOrDefault("daysLeft", "30").toString());
        String weakAreas   = (String) body.getOrDefault("weakAreas", "General Knowledge");
        double accuracy    = Double.parseDouble(body.getOrDefault("currentAccuracy", "50").toString());

        String plan = aiService.generateStudyPlan(examName, daysLeft, weakAreas, accuracy);

        return ResponseEntity.ok(ApiResponse.success("Study plan generated", Map.of(
                "studyPlan", plan,
                "aiUsed",    aiService.isAvailable())));
    }

    @PostMapping("/personalized-test")
    @Operation(summary = "Get personalized test recommendations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> personalizedTest(
            @RequestBody Map<String, Object> body) {

        String weakAreas = (String) body.getOrDefault("weakAreas", "");
        String examName  = (String) body.getOrDefault("examName", "Competitive Exam");

        String suggestion = aiService.generatePersonalizedTest(weakAreas, examName);

        return ResponseEntity.ok(ApiResponse.success("Test recommendations", Map.of(
                "recommendation", suggestion,
                "aiUsed",         aiService.isAvailable())));
    }

    @GetMapping("/status")
    @Operation(summary = "Check if AI is available")
    public ResponseEntity<ApiResponse<Map<String, Object>>> status() {
        return ResponseEntity.ok(ApiResponse.success("AI status", Map.of(
                "available", aiService.isAvailable())));
    }
}
