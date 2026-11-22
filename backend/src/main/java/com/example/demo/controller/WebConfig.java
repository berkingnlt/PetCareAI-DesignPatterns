package com.example.demo.controller;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Tüm yollara izin ver
                .allowedOrigins("*") // Tüm kökenlere (5500, 3000 vs.) izin ver
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Tüm metodlara izin ver
                .allowedHeaders("*"); // Tüm başlıklara izin ver
    }
}
