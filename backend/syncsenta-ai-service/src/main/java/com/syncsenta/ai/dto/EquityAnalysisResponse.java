package com.syncsenta.ai.dto;

import java.util.List;

/**
 * Response DTO for equity analysis with heatmap data
 */
public record EquityAnalysisResponse(
    List<HeatmapData> heatmap,
    Long timestamp
) {
    public record HeatmapData(
        String ward,
        String resourceLevel,
        Double avgScore,
        String correlation
    ) {}
}
