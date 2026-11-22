package com.example.demo.patterns.strategy;

import java.util.List;

// GoF Strategy - Strategy: interchangeable clinic sorting contract.
public interface ClinicSortingStrategy {
    List<ClinicRanking> sort(List<ClinicRanking> clinics);
}
