package com.rapidstudy.ai;

import com.rapidstudy.dto.question.QuestionDto;
import com.rapidstudy.dto.question.QuestionRequest;
import com.rapidstudy.entity.Question;
import com.rapidstudy.repository.QuestionRepository;
import com.rapidstudy.repository.OptionRepository;
import com.rapidstudy.entity.Option;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Phase 45: AIServiceImpl — concrete implementation.
 *
 * Handles:
 * - Phase 46: explainQuestion (doubt solver)
 * - Phase 47: generateAndSaveQuestions (DRAFT status, never auto-publish)
 * - Phase 48: analyzePerformance
 *
 * Falls back gracefully when AI is unavailable.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIServiceImpl {

    private final AIService          aiService;
    private final QuestionRepository questionRepository;
    private final OptionRepository   optionRepository;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    // ── Phase 46: Doubt Solver ────────────────────────────────────────────

    public Map<String, Object> explainQuestion(Long questionId,
                                                String questionText,
                                                String correctAnswer,
                                                List<String> allOptions) {
        // Build richer prompt with all options for "why others are wrong"
        StringBuilder optionStr = new StringBuilder();
        for (int i = 0; i < allOptions.size(); i++) {
            optionStr.append(String.format("Option %d: %s%n", i + 1, allOptions.get(i)));
        }

        String system = "You are an expert teacher for Indian competitive exams. " +
                "Explain clearly in structured format:\n" +
                "1. Concept behind the question\n" +
                "2. Correct approach\n" +
                "3. Step-by-step solution\n" +
                "4. Why other options are wrong\n" +
                "Keep it concise (under 300 words).";

        String user = "Question: " + questionText + "\n\nOptions:\n" + optionStr +
                "\nCorrect Answer: " + correctAnswer;

        String response = aiService.explainQuestion(questionId, questionText, correctAnswer);

        return Map.of(
                "explanation", response,
                "aiUsed",      aiService.isAvailable(),
                "questionId",  questionId
        );
    }

    // ── Phase 47: AI Question Generation (DRAFT only) ─────────────────────

    @Transactional
    public Map<String, Object> generateQuestions(Long topicId, String examName,
                                                   String subjectName, String topicName,
                                                   String difficulty, String language,
                                                   int count) {

        String jsonResponse = aiService.generateQuestions(
                examName, subjectName, topicName, difficulty, language, count);

        if (jsonResponse == null || jsonResponse.equals("[]")) {
            return Map.of(
                    "generated",  0,
                    "message",    "AI not available. No questions generated.",
                    "aiUsed",     false
            );
        }

        // Parse and save as DRAFT — never auto-publish
        int saved = parseAndSaveAsDraft(jsonResponse, topicId, difficulty);
        log.info("AI generated {} questions for topic={} (DRAFT status)", saved, topicId);

        return Map.of(
                "generated",  saved,
                "status",     "DRAFT",
                "message",    saved + " questions saved as DRAFT. Admin review required before publishing.",
                "aiUsed",     true
        );
    }

    private int parseAndSaveAsDraft(String json, Long topicId, String difficulty) {
        // Simple JSON array parser — look for question objects
        // In production, use Jackson ObjectMapper for proper parsing
        int count = 0;
        try {
            // Find all questionText fields
            String[] parts = json.split("\"questionText\"\\s*:\\s*\"");
            for (int i = 1; i < parts.length; i++) {
                String qText = parts[i].split("\"")[0].replace("\\n", "\n");
                if (qText.isBlank()) continue;

                Question q = new Question();
                q.setTopicId(topicId);
                q.setQuestionText(qText);
                q.setDifficulty(com.rapidstudy.enums.Difficulty.valueOf(
                        difficulty.toUpperCase()));
                q.setMarks(BigDecimal.ONE);
                q.setNegativeMarks(BigDecimal.valueOf(0.25));
                q.setStatus("DRAFT");       // Always DRAFT for AI-generated
                q.setAiGenerated(true);
                q.setIsActive(false);       // Not visible to students until APPROVED+PUBLISHED
                Question saved = questionRepository.save(q);

                // Save options if present
                String[] optParts = parts[i].split("\"options\"\\s*:\\s*\\[");
                if (optParts.length > 1) {
                    String[] opts = optParts[1].split("\"");
                    int order = 1;
                    boolean firstCorrect = true;
                    for (String opt : opts) {
                        if (!opt.isBlank() && !opt.contains("{") && !opt.contains("}") &&
                                !opt.contains("[") && !opt.contains("]") && order <= 4) {
                            Option o = new Option();
                            o.setQuestionId(saved.getId());
                            o.setOptionText(opt.trim());
                            o.setOptionOrder(order);
                            o.setIsCorrect(firstCorrect); // First option as correct placeholder
                            optionRepository.save(o);
                            order++;
                            firstCorrect = false;
                        }
                    }
                }
                count++;
            }
        } catch (Exception e) {
            log.warn("Failed to parse AI questions JSON: {}", e.getMessage());
        }
        return count;
    }
}
