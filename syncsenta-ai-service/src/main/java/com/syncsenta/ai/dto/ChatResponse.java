package com.syncsenta.ai.dto;

/**
 * Response DTO for AI chat interactions
 */
public record ChatResponse(
    String response,
    String sessionId,
    Long timestamp
) {}
