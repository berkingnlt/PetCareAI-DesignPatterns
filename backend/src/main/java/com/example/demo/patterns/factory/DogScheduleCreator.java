package com.example.demo.patterns.factory;

// GoF Factory Method - ConcreteCreator.
public class DogScheduleCreator extends VaccineScheduleCreator {
    @Override public VaccineSchedule createSchedule() { return new DogVaccineSchedule(); }
}
