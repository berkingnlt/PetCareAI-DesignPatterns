package com.example.demo.patterns.factory;

import java.util.LinkedHashMap;
import java.util.Map;

// GoF Factory Method - ConcreteProduct: illustrative cat schedule from the original UI.
public class CatVaccineSchedule implements VaccineSchedule {
    @Override public Map<String, Integer> rulesForAgeWeeks(int ageWeeks) {
        Map<String, Integer> rules = new LinkedHashMap<>();
        if (ageWeeks >= 6 && ageWeeks < 8) {
            rules.put("Karma", 0); rules.put("İç/Dış Parazit", 14);
        } else if (ageWeeks >= 9 && ageWeeks < 12) {
            rules.put("Karma", 0); rules.put("Lösemi (FeLV)", 0); rules.put("İç/Dış Parazit", 14);
        } else if (ageWeeks >= 12 && ageWeeks < 14) {
            rules.put("Karma", 0); rules.put("Lösemi (FeLV)", 0); rules.put("Kuduz", 0); rules.put("İç/Dış Parazit", 30);
        } else if (ageWeeks >= 14 && ageWeeks < 52) {
            rules.put("İç/Dış Parazit", 30);
        } else if (ageWeeks >= 52) {
            rules.put("Karma", 365); rules.put("Kuduz", 365); rules.put("İç/Dış Parazit", 90); rules.put("Lösemi (FeLV)", 365);
        }
        return rules;
    }
}
