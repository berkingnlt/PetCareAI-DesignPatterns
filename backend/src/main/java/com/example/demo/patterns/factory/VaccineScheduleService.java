package com.example.demo.patterns.factory;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class VaccineScheduleService {
    public Map<String, Integer> rules(String type, int ageWeeks) {
        if (ageWeeks < 0) throw new IllegalArgumentException("Yas negatif olamaz.");
        VaccineScheduleCreator creator = switch (type == null ? "" : type.toLowerCase()) {
            case "cat" -> new CatScheduleCreator();
            case "dog" -> new DogScheduleCreator();
            default -> throw new IllegalArgumentException("Desteklenmeyen hayvan turu: " + type);
        };
        return creator.rulesForAgeWeeks(ageWeeks);
    }
}
