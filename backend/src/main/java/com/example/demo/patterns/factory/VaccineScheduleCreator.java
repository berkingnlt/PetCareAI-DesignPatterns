package com.example.demo.patterns.factory;

// GoF Factory Method - Creator: subclasses decide which product to create.
public abstract class VaccineScheduleCreator {
    public abstract VaccineSchedule createSchedule();
    public java.util.Map<String, Integer> rulesForAgeWeeks(int ageWeeks) {
        return createSchedule().rulesForAgeWeeks(ageWeeks);
    }
}
