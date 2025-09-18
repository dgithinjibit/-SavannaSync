package com.syncsenta.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

/**
 * Student context information for personalized AI tutoring
 */
public record StudentContext(
    @NotNull
    @Min(1) @Max(12)
    Integer gradeLevel,
    
    @NotBlank
    String currentSubject,
    
    @NotNull
    ResourceLevel resourceLevel,
    
    String schoolId,
    String teacherCustomization
) {
    public enum ResourceLevel {
        LOW, MEDIUM, HIGH
    }
}
