package com.syncsenta.ai.controller;

import com.syncsenta.ai.dto.ChatRequest;
import com.syncsenta.ai.dto.ChatResponse;
import com.syncsenta.ai.service.StudentTutorService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * REST controller for student AI tutoring endpoints
 */
@RestController
@RequestMapping("/tutor")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://syncsenta.netlify.app"})
public class StudentTutorController {
    
    private static final Logger logger = LoggerFactory.getLogger(StudentTutorController.class);
    
    private final StudentTutorService tutorService;
    
    public StudentTutorController(StudentTutorService tutorService) {
        this.tutorService = tutorService;
    }
    
    /**
     * Chat endpoint for student tutoring
     * POST /api/tutor/chat
     */
    @PostMapping("/chat")
    public Mono<ResponseEntity<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        logger.info("Received chat request for Grade {} {} student", 
                   request.studentContext().gradeLevel(), 
                   request.studentContext().currentSubject());
        
        return tutorService.createTutorResponse(request.message(), request.studentContext())
                .map(response -> {
                    var chatResponse = new ChatResponse(
                        response,
                        UUID.randomUUID().toString(),
                        System.currentTimeMillis()
                    );
                    return ResponseEntity.ok(chatResponse);
                })
                .doOnSuccess(result -> logger.info("Chat response generated successfully"))
                .doOnError(error -> logger.error("Error generating chat response: ", error));
    }
    
    /**
     * Streaming chat endpoint for real-time responses
     * POST /api/tutor/chat/stream
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@Valid @RequestBody ChatRequest request) {
        logger.info("Received streaming chat request for Grade {} {} student", 
                   request.studentContext().gradeLevel(), 
                   request.studentContext().currentSubject());
        
        return tutorService.createTutorResponseStream(request.message(), request.studentContext())
                .map(chunk -> "data: " + chunk + "\n\n")
                .doOnComplete(() -> logger.info("Streaming chat response completed"))
                .doOnError(error -> logger.error("Error in streaming chat: ", error));
    }
    
    /**
     * Health check endpoint for the tutor service
     * GET /api/tutor/health
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<String>> health() {
        return Mono.just(ResponseEntity.ok("Mwalimu AI Tutor is ready! 🎓"));
    }
}
