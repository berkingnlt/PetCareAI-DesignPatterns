package com.example.demo.controller;

import com.example.demo.model.Appointment;
import com.example.demo.patterns.facade.AppointmentFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {
    private final AppointmentFacade facade;

    public AppointmentController(AppointmentFacade facade) { this.facade = facade; }

    @GetMapping public List<Appointment> getAllAppointments() { return facade.all(); }
    @GetMapping("/vet/{email}") public List<Appointment> getAppointmentsByVet(@PathVariable String email) { return facade.byVet(email); }
    @GetMapping("/owner/{email}") public List<Appointment> getAppointmentsByOwner(@PathVariable String email) { return facade.byOwner(email); }
    @PostMapping public Appointment createAppointment(@RequestBody Appointment appointment) { return facade.create(appointment); }
    @PutMapping("/{id}") public Appointment updateAppointment(@PathVariable Long id, @RequestBody Appointment data) { return facade.updateDetails(id, data); }
    @PutMapping("/{id}/status") public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam String newStatus) { return ResponseEntity.ok(facade.changeStatus(id, newStatus)); }
    @PutMapping("/{id}/quote") public ResponseEntity<Appointment> quoteAppointment(@PathVariable Long id, @RequestParam Double price) { return ResponseEntity.ok(facade.quote(id, price)); }
    @PutMapping("/{id}/confirm") public ResponseEntity<Appointment> confirmAppointment(@PathVariable Long id) { return ResponseEntity.ok(facade.confirm(id)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) { facade.delete(id); return ResponseEntity.ok().build(); }
    @PutMapping("/{id}/review") public ResponseEntity<Appointment> addReview(@PathVariable Long id, @RequestBody Appointment data) { return ResponseEntity.ok(facade.review(id, data)); }
    @GetMapping("/vet/{email}/reviews") public List<Appointment> getVetReviews(@PathVariable String email) {
        return facade.byVet(email).stream().filter(a -> a.getRating() != null && a.getRating() > 0).toList();
    }
}
