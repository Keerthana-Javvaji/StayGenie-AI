package com.staygenie.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SentimentAgent {

    @Autowired
    private GroqService groqService;

    public String analyzeSentiment(String reviewText) {
        String systemPrompt = """
                You are a sentiment analysis AI.
                Analyze the sentiment of the given hotel review.
                
                Respond with ONLY one word — exactly one of these three options:
                POSITIVE
                NEGATIVE
                NEUTRAL
                
                No explanation, no punctuation, just the single word.
                """;

        String result = groqService.chat(systemPrompt, reviewText).trim().toUpperCase();

        if (result.contains("POSITIVE")) return "POSITIVE";
        if (result.contains("NEGATIVE")) return "NEGATIVE";
        return "NEUTRAL";
    }
}