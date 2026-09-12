package com.rapidstudy.ai;

/**
 * Rule-based fallback responses when AI is unavailable.
 * Returns structured, helpful responses without any LLM call.
 */
public final class RuleBasedFallback {

    private RuleBasedFallback() {}

    public static String explainQuestion() {
        return "AI explanation is not available right now. " +
               "Please refer to the explanation provided with this question or consult your study material.";
    }

    public static String analyzePerformance(double accuracy, String weakSubject) {
        if (accuracy >= 80) {
            return "Excellent performance! Keep up the great work. " +
                   "Focus on maintaining your accuracy across all subjects.";
        } else if (accuracy >= 60) {
            return "Good progress! Your accuracy is " + String.format("%.1f%%", accuracy) + ". " +
                   "Consider spending more time on " + weakSubject + " to improve your overall score.";
        } else {
            return "You are making progress. Focus on understanding core concepts in " + weakSubject + ". " +
                   "Practice more questions in your weak areas and review explanations carefully.";
        }
    }

    public static String generateStudyPlan(String examName, int daysLeft) {
        return "Recommended study plan for " + examName + " (" + daysLeft + " days remaining):\n" +
               "- Spend 60% of time on weak subjects\n" +
               "- Attempt at least 1 mock test every 3 days\n" +
               "- Review wrong answers daily\n" +
               "- Focus on previous year papers in the last 2 weeks\n" +
               "Enable AI for a personalized plan tailored to your performance data.";
    }

    public static String personalizedTestSuggestion() {
        return "Based on standard exam patterns, we recommend attempting tests in your weak areas first. " +
               "Enable AI for personalized recommendations based on your performance history.";
    }
}
