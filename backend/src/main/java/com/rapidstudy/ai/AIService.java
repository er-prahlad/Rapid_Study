package com.rapidstudy.ai;

import com.rapidstudy.dto.question.QuestionRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Phase 45: Central AI service.
 *
 * Uses AIProvider (OpenAI etc.) when available.
 * Falls back to rule-based responses when AI is disabled or API key is missing.
 *
 * Application ALWAYS works regardless of AI availability.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final AIProvider aiProvider;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    // ── explainQuestion ─────────────────────────────────────────────────

    public String explainQuestion(Long questionId, String questionText, String correctAnswer) {
        if (!isAvailable()) return RuleBasedFallback.explainQuestion();

        String system = "You are an expert teacher for Indian competitive exams (SSC, UPSC, BPSC, Railway, Banking). " +
                        "Give a clear, concise explanation in 3-5 sentences. Be factual and educational.";
        String user   = "Explain this question and why the answer is correct:\n\n" +
                        "Question: " + questionText + "\n" +
                        "Correct Answer: " + correctAnswer;

        String result = aiProvider.complete(system, user);
        return result != null ? result : RuleBasedFallback.explainQuestion();
    }

    // ── generateQuestions ───────────────────────────────────────────────

    /**
     * Returns a JSON string of question data. Admin must review before publishing.
     * Never auto-published — always returned as DRAFT status.
     */
    public String generateQuestions(String examName, String subjectName, String topicName,
                                    String difficulty, String language, int count) {
        if (!isAvailable()) return "[]";

        String system = "You are an expert question setter for Indian competitive exams. " +
                        "Generate MCQ questions in valid JSON array format. " +
                        "Each question must have: questionText, options (array of 4), correctOptionIndex (0-3), explanation.";
        String user   = "Generate " + count + " MCQ questions for:\n" +
                        "Exam: " + examName + "\nSubject: " + subjectName +
                        "\nTopic: " + topicName + "\nDifficulty: " + difficulty +
                        "\nLanguage: " + language + "\n\nReturn ONLY valid JSON array.";

        String result = aiProvider.complete(system, user);
        return result != null ? result : "[]";
    }

    // ── analyzePerformance ──────────────────────────────────────────────

    public String analyzePerformance(double accuracy, double averageScore,
                                      String weakSubject, int testsAttempted) {
        if (!isAvailable())
            return RuleBasedFallback.analyzePerformance(accuracy, weakSubject);

        String system = "You are an academic performance coach for Indian competitive exam students. " +
                        "Give actionable, specific advice in 4-6 sentences.";
        String user   = "Analyze this student's performance:\n" +
                        "Overall Accuracy: " + String.format("%.1f%%", accuracy) + "\n" +
                        "Average Score: " + String.format("%.1f%%", averageScore) + "\n" +
                        "Tests Attempted: " + testsAttempted + "\n" +
                        "Weakest Subject: " + weakSubject + "\n" +
                        "Provide specific improvement recommendations.";

        String result = aiProvider.complete(system, user);
        return result != null ? result : RuleBasedFallback.analyzePerformance(accuracy, weakSubject);
    }

    // ── generateStudyPlan ───────────────────────────────────────────────

    public String generateStudyPlan(String examName, int daysLeft,
                                     String weakAreas, double currentAccuracy) {
        if (!isAvailable())
            return RuleBasedFallback.generateStudyPlan(examName, daysLeft);

        String system = "You are an expert study planner for Indian competitive exams. " +
                        "Create a structured, realistic study plan.";
        String user   = "Create a study plan:\n" +
                        "Exam: " + examName + "\nDays until exam: " + daysLeft +
                        "\nCurrent accuracy: " + String.format("%.1f%%", currentAccuracy) +
                        "\nWeak areas: " + weakAreas +
                        "\nInclude: daily schedule, topic priority, mock test frequency.";

        String result = aiProvider.complete(system, user);
        return result != null ? result : RuleBasedFallback.generateStudyPlan(examName, daysLeft);
    }

    // ── generatePersonalizedTest ────────────────────────────────────────

    public String generatePersonalizedTest(String weakAreas, String examName) {
        if (!isAvailable()) return RuleBasedFallback.personalizedTestSuggestion();

        String system = "You are a test design expert for Indian competitive exams.";
        String user   = "Recommend a personalized test configuration for a student " +
                        "preparing for " + examName + " with weak areas: " + weakAreas + ". " +
                        "Specify: number of questions per topic, difficulty distribution, time allocation.";

        String result = aiProvider.complete(system, user);
        return result != null ? result : RuleBasedFallback.personalizedTestSuggestion();
    }

    // ── Helper ──────────────────────────────────────────────────────────

    public boolean isAvailable() {
        boolean available = aiEnabled && aiProvider.isAvailable();
        if (!available) log.debug("AI not available (enabled={}, providerReady={})",
                aiEnabled, aiProvider.isAvailable());
        return available;
    }
}
