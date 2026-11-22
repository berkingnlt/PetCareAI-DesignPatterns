package com.example.demo.patterns.strategy;

import java.util.Comparator;
import java.util.List;

// GoF Strategy - ConcreteStrategy.
public class RatingClinicSortStrategy implements ClinicSortingStrategy {
    @Override public List<ClinicRanking> sort(List<ClinicRanking> clinics) {
        return clinics.stream().sorted(
            Comparator.comparingDouble(ClinicRanking::averageRating).reversed()
                .thenComparing(Comparator.comparingInt(ClinicRanking::reviewCount).reversed())
                .thenComparing(ClinicRanking::name, String.CASE_INSENSITIVE_ORDER)
        ).toList();
    }
}
