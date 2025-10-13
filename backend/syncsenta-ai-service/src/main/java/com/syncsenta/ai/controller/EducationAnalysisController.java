package com.syncsenta.ai.controller;

import com.syncsenta.ai.dto.AnalysisRequest;
import com.syncsenta.ai.dto.AnalysisResponse;
import com.syncsenta.ai.dto.EquityAnalysisRequest;
import com.syncsenta.ai.dto.EquityAnalysisResponse;
import com.syncsenta.ai.service.EducationAnalysisService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * REST controller for education analysis endpoints
 */
@RestController
@RequestMapping("/analysis")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://syncsenta.netlify.app"})
public class EducationAnalysisController {
    
    private static final Logger logger = LoggerFactory.getLogger(EducationAnalysisController.class);
    
    private final EducationAnalysisService analysisService;
    
    public EducationAnalysisController(EducationAnalysisService analysisService) {
        this.analysisService = analysisService;
    }
    
    /**
     * School head operational analysis
     * POST /api/analysis/school-head
     */
    @PostMapping("/school-head")
    public Mono<ResponseEntity<AnalysisResponse>> schoolHeadAnalysis(@Valid @RequestBody AnalysisRequest request) {
        logger.info("Received school head analysis request for school: {}", request.schoolId());
        
        return analysisService.generateSchoolHeadAnalysis(request.query(), request.contextData())
                .map(analysis -> {
                    var response = new AnalysisResponse(
                        analysis,
                        "See analysis above for actionable recommendations",
                        System.currentTimeMillis(),
                        UUID.randomUUID().toString()
                    );
                    return ResponseEntity.ok(response);
                })
                .doOnSuccess(result -> logger.info("School head analysis completed"))
                .doOnError(error -> logger.error("Error in school head analysis: ", error));
    }
    
    /**
     * Teacher performance insights
     * POST /api/analysis/teacher
     */
    @PostMapping("/teacher")
    public Mono<ResponseEntity<AnalysisResponse>> teacherAnalysis(@Valid @RequestBody AnalysisRequest request) {
        logger.info("Received teacher analysis request");
        
        return analysisService.generateTeacherInsights(request.query(), request.contextData())
                .map(analysis -> {
                    var response = new AnalysisResponse(
                        analysis,
                        "Review the insights above for classroom improvement strategies",
                        System.currentTimeMillis(),
                        UUID.randomUUID().toString()
                    );
                    return ResponseEntity.ok(response);
                })
                .doOnSuccess(result -> logger.info("Teacher analysis completed"))
                .doOnError(error -> logger.error("Error in teacher analysis: ", error));
    }
    
    /**
     * County equity analysis with heatmap data
     * POST /api/analysis/equity
     */
    @PostMapping("/equity")
    public Mono<ResponseEntity<EquityAnalysisResponse>> equityAnalysis(@Valid @RequestBody EquityAnalysisRequest request) {
        logger.info("Received equity analysis request for county: {}", request.county());
        
        return analysisService.generateEquityAnalysis(request.county())
                .map(ResponseEntity::ok)
                .doOnSuccess(result -> logger.info("Equity analysis completed for county: {}", request.county()))
                .doOnError(error -> logger.error("Error in equity analysis: ", error));
    }
    
    /**
     * County strategic analysis
     * POST /api/analysis/county-strategic
     */
    @PostMapping("/county-strategic")
    public Mono<ResponseEntity<AnalysisResponse>> countyStrategicAnalysis(@Valid @RequestBody AnalysisRequest request) {
        logger.info("Received county strategic analysis request");
        
        return analysisService.generateCountyStrategicAnalysis(request.query(), request.contextData())
                .map(analysis -> {
                    var response = new AnalysisResponse(
                        analysis,
                        "Strategic recommendations are included in the analysis above",
                        System.currentTimeMillis(),
                        UUID.randomUUID().toString()
                    );
                    return ResponseEntity.ok(response);
                })
                .doOnSuccess(result -> logger.info("County strategic analysis completed"))
                .doOnError(error -> logger.error("Error in county strategic analysis: ", error));
    }
    
    /**
     * Health check endpoint for analysis service
     * GET /api/analysis/health
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<String>> health() {
        return Mono.just(ResponseEntity.ok("Education Analysis Service is operational! 📊"));
    }
}
