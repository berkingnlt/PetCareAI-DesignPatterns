package com.example.demo.controller;

import com.example.demo.patterns.factory.VaccineScheduleService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/vaccines")
@CrossOrigin(origins = "*")
public class VaccineScheduleController {
    private final VaccineScheduleService service;
    public VaccineScheduleController(VaccineScheduleService service) { this.service = service; }
    @GetMapping("/schedule")
    public Map<String, Integer> getSchedule(@RequestParam String type, @RequestParam int ageWeeks) {
        return service.rules(type, ageWeeks);
    }
}
