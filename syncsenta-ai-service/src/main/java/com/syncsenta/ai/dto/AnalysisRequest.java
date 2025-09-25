package com.syncsenta.ai.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

/**
 * Request DTO for school analysis queries
 */
public record AnalysisRequest(
    @NotBlank
    String query,
    
    @NotBlank
    String schoolId,
    
    Map<String, Object> contextData,
    
    AnalysisType analysisType
) {
    public enum AnalysisType {
        SCHOOL_HEAD_OPERATIONAL,
        TEACHER_PERFORMANCE,
        COUNTY_EQUITY,
        COUNTY_STRATEGIC
    }
}
