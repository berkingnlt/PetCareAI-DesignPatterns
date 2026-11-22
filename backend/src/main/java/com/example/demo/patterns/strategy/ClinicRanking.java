package com.example.demo.patterns.strategy;

// Internal projection, not exposed as a user/password-bearing API payload.
public record ClinicRanking(String email, String name, double averageRating, int reviewCount) { }
