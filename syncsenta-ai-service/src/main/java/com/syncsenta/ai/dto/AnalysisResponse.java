package com.syncsenta.ai.dto;

/**
 * Response DTO for analysis requests
 */
public record AnalysisResponse(
    String analysis,
    String recommendations,
    Long timestamp,
    String analysisId
) {}
