package com.example.demo.controller;

import com.example.demo.model.Availability;
import com.example.demo.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availabilities")
@CrossOrigin(origins = "*") 
public class AvailabilityController {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    // TOPLU MÜSAİTLİK EKLEME
    @PostMapping("/bulk")
    public List<Availability> addAvailabilities(@RequestBody List<Availability> availabilities) {
        return availabilityRepository.saveAll(availabilities);
    }

    // VETERİNERE GÖRE BOŞ SAATLERİ GETİR (Sadece o hekimin saatleri)
    @GetMapping("/vet/{email}")
    public List<Availability> getAvailabilitiesByVet(@PathVariable String email) {
        return availabilityRepository.findByVetEmail(email);
    }

    // MÜSAİTLİK SİL 
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAvailability(@PathVariable Long id) {
        availabilityRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}