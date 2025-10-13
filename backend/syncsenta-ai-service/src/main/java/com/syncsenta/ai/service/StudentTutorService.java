package com.syncsenta.ai.service;

import com.syncsenta.ai.dto.StudentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service for student AI tutoring using Mwalimu AI personality
 */
@Service
public class StudentTutorService {
    
    private static final Logger logger = LoggerFactory.getLogger(StudentTutorService.class);
    
    private final HederaAiClientService hederaClient;
    
    public StudentTutorService(HederaAiClientService hederaClient) {
        this.hederaClient = hederaClient;
    }
    
    /**
     * Create a chat response for student tutoring
     */
    public Mono<String> createTutorResponse(String message, StudentContext context) {
        String systemPrompt = buildSystemPrompt(context);
        
        logger.info("Creating tutor response for Grade {} {} student", 
                   context.gradeLevel(), context.currentSubject());
        
        if (context.resourceLevel() == StudentContext.ResourceLevel.LOW) {
            logger.info("Adapting response for low-resource environment");
        }
        
        return hederaClient.chatCompletion(systemPrompt, message);
    }
    
    /**
     * Create a streaming chat response for student tutoring
     */
    public Flux<String> createTutorResponseStream(String message, StudentContext context) {
        String systemPrompt = buildSystemPrompt(context);
        
        logger.info("Creating streaming tutor response for Grade {} {} student", 
                   context.gradeLevel(), context.currentSubject());
        
        return hederaClient.chatCompletionStream(systemPrompt, message);
    }
    
    private String buildSystemPrompt(StudentContext context) {
        boolean isLowResource = context.resourceLevel() == StudentContext.ResourceLevel.LOW;
        
        StringBuilder prompt = new StringBuilder();
        prompt.append(String.format("""
            ROLE: You are Mwalimu AI, a fun, curious, and super friendly learning buddy for a student in Kenya. 
            Your goal is to make learning feel like an exciting adventure, not a boring class.
            
            CURRENT CONTEXT: The student is in Grade %d and we're exploring %s.
            
            YOUR VIBE:
            - Super encouraging and positive! Use emojis to keep it fun. 😉
            - You're not a teacher, you're a co-explorer.
            - Your language is simple, clear, and relatable.
            
            YOUR CORE RULES (These are super important!):
            1. **NEVER, EVER give direct answers.** Your job is to guide, not to tell. Ask cool questions that make the student think and discover the answer themselves.
            2. **Adapt your examples.** %s
            3. **Keep it short & snappy.** 1-2 sentences is perfect.
            4. **Always end with a question.** This keeps the adventure going!
            5. **Use CBC curriculum references** when appropriate for Grade %d level.
            """, 
            context.gradeLevel(), 
            context.currentSubject(),
            getResourceAdaptationText(isLowResource),
            context.gradeLevel()
        ));
        
        // Add teacher customization if provided
        if (context.teacherCustomization() != null && !context.teacherCustomization().isBlank()) {
            prompt.append("\n\n---\nSPECIAL INSTRUCTIONS FROM YOUR TEACHER:\n")
                  .append(context.teacherCustomization())
                  .append("\n---\n");
        }
        
        return prompt.toString();
    }
    
    private String getResourceAdaptationText(boolean isLowResource) {
        if (isLowResource) {
            return """
                Since the student is in a low-resource setting, talk about everyday things like sharing fruit, 
                playing games outside, stories about animals, or things they can find in nature. 
                Avoid talking about computers, internet, or expensive equipment.
                """;
        } else {
            return """
                You can use a wide range of examples including technology, books, online resources, 
                and various learning materials that might be available to the student.
                """;
        }
    }
}
