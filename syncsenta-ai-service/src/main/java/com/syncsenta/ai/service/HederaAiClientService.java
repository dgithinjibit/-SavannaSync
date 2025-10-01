package com.syncsenta.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

/**
 * Service for integrating with Hedera Moonscape AI Agent
 */
@Service
public class HederaAiClientService {
    
    private static final Logger logger = LoggerFactory.getLogger(HederaAiClientService.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final int maxTokens;
    private final double temperature;
    
    public HederaAiClientService(
            @Value("${hedera.ai.base-url}") String baseUrl,
            @Value("${hedera.ai.api-key}") String apiKey,
            @Value("${hedera.ai.timeout}") Duration timeout,
            @Value("${hedera.ai.max-tokens}") int maxTokens,
            @Value("${hedera.ai.temperature}") double temperature,
            ObjectMapper objectMapper) {
        
        this.maxTokens = maxTokens;
        this.temperature = temperature;
        this.objectMapper = objectMapper;
        
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
        
        logger.info("Hedera AI Client initialized with base URL: {}", baseUrl);
    }
    
    /**
     * Send a chat completion request to Hedera Moonscape AI
     */
    public Mono<String> chatCompletion(String systemPrompt, String userMessage) {
        var requestBody = Map.of(
            "model", "hedera-moonscape-chat",
            "messages", new Object[] {
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            },
            "max_tokens", maxTokens,
            "temperature", temperature,
            "stream", false
        );
        
        return webClient.post()
                .uri("/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(this::extractChatResponse)
                .doOnError(error -> logger.error("Error calling Hedera AI: ", error))
                .onErrorReturn("Sorry, I'm having trouble thinking right now. Please try again.");
    }
    
    /**
     * Send a streaming chat completion request
     */
    public Flux<String> chatCompletionStream(String systemPrompt, String userMessage) {
        var requestBody = Map.of(
            "model", "hedera-moonscape-chat",
            "messages", new Object[] {
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            },
            "max_tokens", maxTokens,
            "temperature", temperature,
            "stream", true
        );
        
        return webClient.post()
                .uri("/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .filter(line -> line.startsWith("data: "))
                .map(line -> line.substring(6))
                .filter(data -> !data.equals("[DONE]"))
                .map(this::extractStreamingResponse)
                .filter(text -> !text.isEmpty())
                .doOnError(error -> logger.error("Error in streaming chat: ", error))
                .onErrorReturn("Sorry, I had trouble with that. Could you ask again?");
    }
    
    /**
     * Send an analysis request for structured data analysis
     */
    public Mono<String> analysisCompletion(String systemPrompt, String userQuery, Map<String, Object> contextData) {
        String contextJson = "";
        try {
            contextJson = objectMapper.writeValueAsString(contextData);
        } catch (Exception e) {
            logger.warn("Failed to serialize context data: ", e);
        }
        
        String fullPrompt = String.format("""
            Context Data:
            %s
            
            User Query:
            %s
            """, contextJson, userQuery);
        
        var requestBody = Map.of(
            "model", "hedera-moonscape-analyst",
            "messages", new Object[] {
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", fullPrompt)
            },
            "max_tokens", maxTokens * 2, // Analysis needs more tokens
            "temperature", temperature * 0.8 // Less creative for analysis
        );
        
        return webClient.post()
                .uri("/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(this::extractChatResponse)
                .doOnError(error -> logger.error("Error in analysis completion: ", error))
                .onErrorReturn("Unable to complete analysis at this time. Please try again.");
    }
    
    private String extractChatResponse(JsonNode response) {
        try {
            return response.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        } catch (Exception e) {
            logger.error("Failed to extract chat response: ", e);
            return "I had trouble processing that response.";
        }
    }
    
    private String extractStreamingResponse(String data) {
        try {
            JsonNode json = objectMapper.readTree(data);
            return json.path("choices")
                    .get(0)
                    .path("delta")
                    .path("content")
                    .asText("");
        } catch (Exception e) {
            return "";
        }
    }
}
