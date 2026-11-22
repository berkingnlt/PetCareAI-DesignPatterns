package com.example.demo.patterns.strategy;

import java.util.List;

// GoF Strategy - Context: delegates sorting to a selected strategy.
public class ClinicSortingContext {
    private ClinicSortingStrategy strategy;
    public ClinicSortingContext(ClinicSortingStrategy strategy) { this.strategy = strategy; }
    public void setStrategy(ClinicSortingStrategy strategy) { this.strategy = strategy; }
    public List<ClinicRanking> sort(List<ClinicRanking> clinics) { return strategy.sort(clinics); }
}
