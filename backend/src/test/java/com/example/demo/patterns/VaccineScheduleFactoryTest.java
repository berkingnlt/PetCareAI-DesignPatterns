package com.example.demo.patterns;

import com.example.demo.patterns.factory.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VaccineScheduleFactoryTest {
    @Test void concreteCreatorsProduceDifferentSchedules() {
        VaccineScheduleCreator cat = new CatScheduleCreator();
        VaccineScheduleCreator dog = new DogScheduleCreator();
        assertInstanceOf(CatVaccineSchedule.class, cat.createSchedule());
        assertInstanceOf(DogVaccineSchedule.class, dog.createSchedule());
        assertTrue(cat.rulesForAgeWeeks(12).containsKey("Lösemi (FeLV)"));
        assertTrue(dog.rulesForAgeWeeks(12).containsKey("Bronşin"));
    }

    @Test void earlyOrUnknownTypesAreHandled() {
        assertTrue(new CatScheduleCreator().rulesForAgeWeeks(2).isEmpty());
        VaccineScheduleService service = new VaccineScheduleService();
        assertThrows(IllegalArgumentException.class, () -> service.rules("bird", 12));
        assertThrows(IllegalArgumentException.class, () -> service.rules("cat", -1));
    }
}
