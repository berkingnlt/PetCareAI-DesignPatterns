package com.example.demo.controller;

import com.example.demo.patterns.strategy.ClinicRankingService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clinics")
@CrossOrigin(origins = "*")
public class ClinicSortingController {
    private final ClinicRankingService service;
    public ClinicSortingController(ClinicRankingService service) { this.service = service; }
    @GetMapping("/sort-order")
    public List<String> sortOrder(@RequestParam(defaultValue = "name") String by) {
        return service.clinicEmailsBy(by);
    }
}
