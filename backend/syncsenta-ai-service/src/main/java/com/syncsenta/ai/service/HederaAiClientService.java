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
 * Service for Hedera AI Agent using OpenAI as the exclusive LLM Provider
 * Simplified configuration for reliable performance
 */
@Service
public class HederaAiClientService {
    
    private static final Logger logger = LoggerFactory.getLogger(HederaAiClientService.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final int maxTokens;
    private final double temperature;
    private final String apiKey;
    private final String baseUrl;
    private final String model;
    
    public HederaAiClientService(
            @Value("${openai.api.key}") String openaiApiKey,
            @Value("${openai.api.base-url}") String openaiBaseUrl,
            @Value("${openai.api.model}") String openaiModel,
            @Value("${openai.api.max-tokens}") int maxTokens,
            @Value("${openai.api.temperature}") double temperature,
            @Value("${openai.api.timeout}") Duration timeout,
            ObjectMapper objectMapper) {
        
        this.maxTokens = maxTokens;
        this.temperature = temperature;
        this.objectMapper = objectMapper;
        this.apiKey = openaiApiKey;
        this.baseUrl = openaiBaseUrl;
        this.model = openaiModel;
        
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty() || openaiApiKey.contains("your_openai_api_key")) {
            throw new IllegalArgumentException("OpenAI API key not configured! Please set OPENAI_API_KEY");
        }
        
        this.webClient = WebClient.builder()
                .baseUrl(this.baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + this.apiKey)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
        
        logger.info("Hedera AI Agent initialized with OpenAI LLM Provider");
        logger.info("Base URL: {}", this.baseUrl);
        logger.info("Model: {}", this.model);
    }
    
    /**
     * Send a chat completion request using OpenAI
     */
    public Mono<String> chatCompletion(String systemPrompt, String userMessage) {
        var requestBody = Map.of(
            "model", model,
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
                .map(this::extractOpenAIResponse)
                .doOnError(error -> logger.error("Error calling OpenAI API: ", error))
                .onErrorReturn("Sorry, I'm having trouble thinking right now. Please try again.");
    }
    
    /**
     * Send a streaming chat completion request using OpenAI
     */
    public Flux<String> chatCompletionStream(String systemPrompt, String userMessage) {
        var requestBody = Map.of(
            "model", model,
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
        
        return chatCompletion(systemPrompt + "\n\nYou are performing data analysis. Be thorough and provide insights.", fullPrompt);
    }
    
    /**
     * Extract response from OpenAI API
     */
    private String extractOpenAIResponse(JsonNode response) {
        try {
            return response.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        } catch (Exception e) {
            logger.error("Failed to extract OpenAI response: ", e);
            return "I had trouble processing that response.";
        }
    }
    
    /**
     * Extract streaming response from OpenAI API
     */
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
