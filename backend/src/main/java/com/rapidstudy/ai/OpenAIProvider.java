package com.rapidstudy.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * OpenAI GPT provider.
 * Falls back to null if AI_API_KEY is not set — the application continues to work.
 */
@Slf4j
@Component
public class OpenAIProvider implements AIProvider {

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Override
    public String getName() { return "OpenAI/" + model; }

    @Override
    public String complete(String systemPrompt, String userMessage) {
        if (!isAvailable()) return null;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system",  "content", systemPrompt),
                            Map.of("role", "user",    "content", userMessage)
                    ),
                    "max_tokens", 1024,
                    "temperature", 0.7
            );

            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.openai.com/v1/chat/completions",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                var choices = (List<?>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    var message = ((Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message"));
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            log.warn("OpenAI call failed: {}", e.getMessage());
        }
        return null;
    }
}
