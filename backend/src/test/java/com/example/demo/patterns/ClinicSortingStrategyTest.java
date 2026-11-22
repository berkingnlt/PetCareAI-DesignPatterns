package com.example.demo.patterns;

import com.example.demo.patterns.strategy.*;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class ClinicSortingStrategyTest {
    @Test void strategyCanChangeAtRuntime() {
        ClinicRanking a = new ClinicRanking("a@example.test", "Alpha", 3.0, 2);
        ClinicRanking b = new ClinicRanking("b@example.test", "Beta", 4.8, 1);
        ClinicRanking c = new ClinicRanking("c@example.test", "Gamma", 4.0, 12);
        List<ClinicRanking> clinics = List.of(c, b, a);
        ClinicSortingContext context = new ClinicSortingContext(new NameClinicSortStrategy());
        assertEquals("Alpha", context.sort(clinics).get(0).name());
        context.setStrategy(new RatingClinicSortStrategy());
        assertEquals("Beta", context.sort(clinics).get(0).name());
        context.setStrategy(new ReviewCountClinicSortStrategy());
        assertEquals("Gamma", context.sort(clinics).get(0).name());
        assertEquals("Gamma", clinics.get(0).name());
    }
}
