package com.example.demo.patterns.factory;

// GoF Factory Method - ConcreteCreator.
public class CatScheduleCreator extends VaccineScheduleCreator {
    @Override public VaccineSchedule createSchedule() { return new CatVaccineSchedule(); }
}
