package com.rapidstudy.ai;

/**
 * Phase 45: Adapter pattern for AI providers.
 *
 * Allows different prompt formats/strategies per provider.
 * Extend this class to add custom prompt formatting per LLM.
 */
public abstract class AIProviderAdapter implements AIProvider {

    /**
     * Format a prompt for this specific provider's optimal style.
     * Default: pass through as-is.
     */
    public String formatSystemPrompt(String rawPrompt) {
        return rawPrompt;
    }

    public String formatUserMessage(String rawMessage) {
        return rawMessage;
    }

    @Override
    public String complete(String systemPrompt, String userMessage) {
        return doComplete(
                formatSystemPrompt(systemPrompt),
                formatUserMessage(userMessage)
        );
    }

    /** Implement the actual LLM call in subclasses. */
    protected abstract String doComplete(String systemPrompt, String userMessage);
}
