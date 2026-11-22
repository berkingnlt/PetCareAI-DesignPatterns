package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    // application.properties dosyasındaki şifreyi buraya çekiyoruz (Gizli kalır)
    @Value("${openai.api.key}")
    private String apiKey;

    @PostMapping
    public ResponseEntity<Map<String, String>> askAI(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        String context = payload.get("context"); 

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // OpenAI'a gidecek paketi hazırlıyoruz
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini"); 

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", context));
        messages.add(Map.of("role", "user", "content", userMessage));

        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // OpenAI API'sine İsteği At!
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions", entity, Map.class);

            // Gelen cevabın içinden AI'ın mesajını cımbızla al
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String aiReply = (String) message.get("content");

            // Javascript'e güvenli bir şekilde sadece cevabı gönder
            return ResponseEntity.ok(Map.of("reply", aiReply));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("reply", "Şu an OpenAI sunucularına bağlanamıyorum, lütfen daha sonra tekrar deneyin."));
        }
    }
}