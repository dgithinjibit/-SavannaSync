package com.syncsenta.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for student chat interactions
 */
public record ChatRequest(
    @NotBlank
    String message,
    
    @NotNull
    StudentContext studentContext,
    
    Boolean streamResponse
) {}
