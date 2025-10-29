package com.syncsenta.ai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * Configuration class to validate Hedera AI Agent setup with OpenAI LLM provider
 */
@Configuration
public class AiConfiguration {
    
    private static final Logger logger = LoggerFactory.getLogger(AiConfiguration.class);
    
    @Value("${openai.api.key}")
    private String openaiApiKey;
    
    @Value("${hedera.account.id:#{null}}")
    private String hederaAccountId;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;
    
    @PostConstruct
    public void validateConfiguration() {
        logger.info("=== Hedera AI Agent Configuration ===");
        logger.info("Active Profile: {}", activeProfile);
        if (hederaAccountId != null) {
            logger.info("Hedera Account: {}", hederaAccountId);
        }
        
        boolean hasOpenAI = openaiApiKey != null && !openaiApiKey.trim().isEmpty() && !openaiApiKey.contains("your_openai_api_key");
        
        logger.info("=== LLM Provider Status ===");
        
        if (hasOpenAI) {
            logger.info("OpenAI API key configured - Primary LLM provider");
        } else {
            logger.error("OpenAI API key not configured!");
            logger.error("Please set OPENAI_API_KEY in your environment variables");
            throw new IllegalStateException("OpenAI API key must be configured for Hedera AI Agent");
        }
        
        logger.info("Primary LLM Provider: OpenAI");
        logger.info("=====================================");
    }
}