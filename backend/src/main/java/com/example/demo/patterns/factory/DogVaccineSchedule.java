package com.example.demo.patterns.factory;

import java.util.LinkedHashMap;
import java.util.Map;

// GoF Factory Method - ConcreteProduct: illustrative dog schedule from the original UI.
public class DogVaccineSchedule implements VaccineSchedule {
    @Override public Map<String, Integer> rulesForAgeWeeks(int ageWeeks) {
        Map<String, Integer> rules = new LinkedHashMap<>();
        if (ageWeeks >= 6 && ageWeeks < 8) {
            rules.put("Karma", 0); rules.put("Corona", 0); rules.put("İç/Dış Parazit", 14);
        } else if (ageWeeks >= 9 && ageWeeks < 12) {
            rules.put("Karma", 0); rules.put("Corona", 0); rules.put("Bronşin", 0); rules.put("İç/Dış Parazit", 14);
        } else if (ageWeeks >= 12 && ageWeeks < 14) {
            rules.put("Karma", 0); rules.put("Kuduz", 0); rules.put("Bronşin", 0); rules.put("İç/Dış Parazit", 30);
        } else if (ageWeeks >= 14 && ageWeeks < 52) {
            rules.put("Lyme", 0); rules.put("İç/Dış Parazit", 30);
        } else if (ageWeeks >= 52) {
            rules.put("Karma", 365); rules.put("Kuduz", 365); rules.put("Bronşin", 365); rules.put("Lyme", 365); rules.put("İç/Dış Parazit", 90);
        }
        return rules;
    }
}
