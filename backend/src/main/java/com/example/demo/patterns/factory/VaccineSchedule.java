package com.example.demo.patterns.factory;

import java.util.Map;

// GoF Factory Method - Product: schedule rules are expressed as intervals (days).
public interface VaccineSchedule {
    Map<String, Integer> rulesForAgeWeeks(int ageWeeks);
}
