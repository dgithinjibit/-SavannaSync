package com.syncsenta.ai.service;

import com.syncsenta.ai.dto.EquityAnalysisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Service for educational analysis and insights
 */
@Service
public class EducationAnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(EducationAnalysisService.class);
    
    private final HederaAiClientService hederaClient;
    
    public EducationAnalysisService(HederaAiClientService hederaClient) {
        this.hederaClient = hederaClient;
    }
    
    /**
     * Generate school head operational analysis
     */
    public Mono<String> generateSchoolHeadAnalysis(String query, Map<String, Object> schoolData) {
        String systemPrompt = """
            You are an AI operational consultant for a Kenyan school head. 
            Analyze the provided school data to answer the user's questions. 
            Connect operational data (e.g., high student-teacher ratio) to potential learning impacts 
            (e.g., low engagement in math) and suggest practical, actionable solutions.
            
            Focus on:
            - Resource optimization
            - Student performance improvement
            - Teacher support strategies
            - Infrastructure planning
            - Community engagement
            
            Provide specific, implementable recommendations based on the data provided.
            """;
        
        logger.info("Generating school head analysis for query: {}", query);
        
        return hederaClient.analysisCompletion(systemPrompt, query, schoolData);
    }
    
    /**
     * Generate teacher performance insights
     */
    public Mono<String> generateTeacherInsights(String query, Map<String, Object> classData) {
        String systemPrompt = """
            You are an AI education consultant specializing in teacher support and classroom optimization.
            Analyze the provided class data to help teachers improve student engagement and learning outcomes.
            
            Focus on:
            - Student engagement patterns
            - Learning gaps identification
            - Classroom management strategies
            - Differentiated instruction recommendations
            - Assessment and feedback improvements
            
            Provide practical, classroom-ready suggestions that teachers can implement immediately.
            """;
        
        logger.info("Generating teacher insights for query: {}", query);
        
        return hederaClient.analysisCompletion(systemPrompt, query, classData);
    }
    
    /**
     * Generate county-level equity analysis
     */
    public Mono<EquityAnalysisResponse> generateEquityAnalysis(String county) {
        String systemPrompt = String.format("""
            You are an AI data analyst for Kenyan County Education. 
            Generate a JSON response analyzing the correlation between resource levels and student scores 
            for schools in %s County, Kenya. Group the analysis into fictional wards.
            
            OUTPUT FORMAT: JSON matching the exact schema. NO EXTRA TEXT OR EXPLANATIONS.
            CBC REFERENCE: Use EMIS data guidelines section 4.2
            
            Required JSON Schema:
            {
              "heatmap": [
                {
                  "ward": "string",
                  "resourceLevel": "low|medium|high",
                  "avgScore": number (0-100),
                  "correlation": "strong|moderate|weak"
                }
              ]
            }
            """, county);
        
        String query = String.format("Generate equity analysis heatmap data for %s County", county);
        
        logger.info("Generating equity analysis for county: {}", county);
        
        return hederaClient.analysisCompletion(systemPrompt, query, Map.of("county", county))
                .map(this::parseEquityResponse)
                .onErrorReturn(new EquityAnalysisResponse(
                    java.util.List.of(), 
                    System.currentTimeMillis()
                ));
    }
    
    /**
     * Generate county officer strategic recommendations
     */
    public Mono<String> generateCountyStrategicAnalysis(String query, Map<String, Object> countyData) {
        String systemPrompt = """
            You are an AI data analyst and strategic advisor for a Kenyan County Education Officer. 
            Provide concise, data-driven, and actionable recommendations based on the provided county-wide data. 
            Your insights should help in strategic planning and resource allocation.
            
            Focus on:
            - County-wide performance trends
            - Resource allocation optimization
            - Inter-school collaboration opportunities
            - Policy implementation strategies
            - Long-term development planning
            
            Provide strategic, high-level recommendations that can guide county education policy.
            """;
        
        logger.info("Generating county strategic analysis for query: {}", query);
        
        return hederaClient.analysisCompletion(systemPrompt, query, countyData);
    }
    
    private EquityAnalysisResponse parseEquityResponse(String jsonResponse) {
        try {
            // Parse the JSON response and convert to EquityAnalysisResponse
            // This is a simplified implementation - you'd use ObjectMapper in practice
            logger.info("Parsing equity analysis response");
            
            // For now, return a mock response - replace with actual JSON parsing
            var mockHeatmapData = java.util.List.of(
                new EquityAnalysisResponse.HeatmapData("Central Ward", "high", 85.5, "strong"),
                new EquityAnalysisResponse.HeatmapData("East Ward", "medium", 72.3, "moderate"),
                new EquityAnalysisResponse.HeatmapData("West Ward", "low", 58.7, "weak"),
                new EquityAnalysisResponse.HeatmapData("North Ward", "medium", 76.1, "moderate"),
                new EquityAnalysisResponse.HeatmapData("South Ward", "low", 54.2, "strong")
            );
            
            return new EquityAnalysisResponse(mockHeatmapData, System.currentTimeMillis());
            
        } catch (Exception e) {
            logger.error("Failed to parse equity analysis response: ", e);
            return new EquityAnalysisResponse(java.util.List.of(), System.currentTimeMillis());
        }
    }
}
