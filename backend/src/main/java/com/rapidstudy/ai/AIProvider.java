package com.rapidstudy.ai;

/**
 * Phase 45: AI Provider interface.
 * Implement this to plug in OpenAI, Gemini, Claude, or any other LLM.
 * The application works without an AI provider — fallback responses are returned.
 */
public interface AIProvider {
    /** Send a prompt and get a text response. */
    String complete(String systemPrompt, String userMessage);

    /** Returns false if the provider is misconfigured (e.g. missing API key). */
    boolean isAvailable();

    /** Human-readable provider name for logging/debug. */
    String getName();
}
