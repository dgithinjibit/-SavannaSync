package com.syncsenta.ai.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for county equity analysis
 */
public record EquityAnalysisRequest(
    @NotBlank
    String county
) {}
