package com.staygenie.backend.controller;

import com.staygenie.backend.repository.UserRepository;
import com.staygenie.backend.service.OrchestratorAgent;
import com.staygenie.backend.service.TripPlannerAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private OrchestratorAgent orchestratorAgent;

    @Autowired
    private TripPlannerAgent tripPlannerAgent;

    @Autowired
    private UserRepository userRepository;

    private boolean isTripPlanningRequest(String message) {
        String lower = message.toLowerCase();
        return lower.contains("plan") || lower.contains("itinerary") ||
               lower.contains("trip") || lower.contains("travel") ||
               lower.contains("tour") ||
               (lower.contains("day") && lower.contains("visit"));
    }
    @PostMapping("/trip-plan")
    public ResponseEntity<?> planTrip(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty.");
        }
        String response = tripPlannerAgent.planTrip(userMessage);
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty.");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) auth.getPrincipal();
        Long userId = userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElse(1L);

        String response;
        if (isTripPlanningRequest(userMessage)) {
            response = tripPlannerAgent.planTrip(userMessage);
        } else {
            response = orchestratorAgent.processUserRequest(userMessage, userId);
        }

        return ResponseEntity.ok(Map.of("response", response));
    }
}