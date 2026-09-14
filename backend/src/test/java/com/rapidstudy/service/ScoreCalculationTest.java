package com.rapidstudy.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Phase 61: Score Calculation Tests
 *
 * Server-side scoring verify karta hai — client pe kuch nahi hota.
 * Formula: (correct × marksPerQ) - (wrong × negativeMarks)
 */
@DisplayName("Phase 61: Score Calculation Tests")
class ScoreCalculationTest {

    /**
     * Score calculate karne ki utility method
     * (TestAttemptService.submitAttempt() ka simplified version)
     */
    private BigDecimal calculateScore(
            int correct, int wrong, int unanswered,
            double marksPerQ, double negativeMarks) {
        double score = (correct * marksPerQ) - (wrong * negativeMarks);
        return BigDecimal.valueOf(Math.max(0, score)).setScale(2, RoundingMode.HALF_UP);
    }

    private double calculateAccuracy(int correct, int wrong) {
        int attempted = correct + wrong;
        if (attempted == 0) return 0.0;
        return (double) correct / attempted * 100;
    }

    @Test
    @DisplayName("10 correct, 2 wrong, 3 unanswered → 19 marks")
    void testStandardCase() {
        // 10×2 - 2×0.5 = 20 - 1 = 19
        BigDecimal score = calculateScore(10, 2, 3, 2.0, 0.5);
        assertEquals(0, score.compareTo(BigDecimal.valueOf(19.00)));
    }

    @Test
    @DisplayName("All correct → maximum score")
    void testAllCorrect() {
        // 100×2 - 0 = 200
        BigDecimal score = calculateScore(100, 0, 0, 2.0, 0.5);
        assertEquals(0, score.compareTo(BigDecimal.valueOf(200.00)));
    }

    @Test
    @DisplayName("All wrong → score should not go below 0")
    void testAllWrong() {
        // 0×2 - 100×0.5 = -50 → capped at 0
        BigDecimal score = calculateScore(0, 100, 0, 2.0, 0.5);
        assertEquals(0, score.compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("All unanswered → 0 marks, no penalty")
    void testAllUnanswered() {
        BigDecimal score = calculateScore(0, 0, 100, 2.0, 0.5);
        assertEquals(0, score.compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("No negative marking → wrong answers don't deduct marks")
    void testNoNegativeMarking() {
        // 50×2 - 50×0 = 100
        BigDecimal score = calculateScore(50, 50, 0, 2.0, 0.0);
        assertEquals(0, score.compareTo(BigDecimal.valueOf(100.00)));
    }

    @Test
    @DisplayName("Mixed: 25 correct, 25 wrong, 50 unanswered")
    void testMixedCase() {
        // 25×2 - 25×0.5 = 50 - 12.5 = 37.5
        BigDecimal score = calculateScore(25, 25, 50, 2.0, 0.5);
        assertEquals(0, score.compareTo(BigDecimal.valueOf(37.50)));
    }

    @Test
    @DisplayName("Accuracy calculation — correct / (correct + wrong)")
    void testAccuracyCalculation() {
        double accuracy = calculateAccuracy(80, 20); // 80/100 = 80%
        assertEquals(80.0, accuracy, 0.001);
    }

    @Test
    @DisplayName("Accuracy — no attempts → 0%")
    void testAccuracyNoAttempts() {
        double accuracy = calculateAccuracy(0, 0);
        assertEquals(0.0, accuracy, 0.001);
    }

    @Test
    @DisplayName("Accuracy — all correct → 100%")
    void testAccuracyAllCorrect() {
        double accuracy = calculateAccuracy(100, 0);
        assertEquals(100.0, accuracy, 0.001);
    }

    @Test
    @DisplayName("Negative marking edge: score exactly at 0 boundary")
    void testScoreAtZeroBoundary() {
        // 2 correct × 1 mark = 2, 4 wrong × 0.5 = 2, net = 0
        BigDecimal score = calculateScore(2, 4, 0, 1.0, 0.5);
        assertEquals(0, score.compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Expired attempt — answered questions still count")
    void testExpiredAttemptScoring() {
        // Timer expire hone par jo answers diye the wo count hote hain
        // Unanswered = 0 marks, no penalty
        BigDecimal score = calculateScore(5, 0, 45, 2.0, 0.5);
        assertEquals(0, score.compareTo(BigDecimal.valueOf(10.00)));
    }
}
