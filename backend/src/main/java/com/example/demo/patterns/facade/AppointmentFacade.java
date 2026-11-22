package com.example.demo.patterns.facade;

import com.example.demo.model.Appointment;
import com.example.demo.model.Availability;
import com.example.demo.patterns.state.AppointmentContext;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.AvailabilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

// GoF Facade - Facade: one API for appointment state, persistence and availability.
@Service
public class AppointmentFacade {
    private final AppointmentRepository appointments;
    private final AvailabilityRepository slots;

    public AppointmentFacade(AppointmentRepository appointments, AvailabilityRepository slots) {
        this.appointments = appointments;
        this.slots = slots;
    }

    public List<Appointment> all() { return appointments.findAll(); }
    public List<Appointment> byVet(String email) { return appointments.findByVetEmail(email); }
    public List<Appointment> byOwner(String email) { return appointments.findByOwnerEmail(email); }

    @Transactional
    public Appointment create(Appointment appointment) {
        appointment.setId(null);
        appointment.setStatus("pending");
        appointment.setPrice(null);
        appointment.setRating(null);
        appointment.setReviewText(null);
        if (appointment.getAvailId() != null) {
            Availability slot = slots.findForUpdate(appointment.getAvailId())
                    .orElseThrow(() -> new NoSuchElementException("Randevu saati bulunamadi."));
            if (Boolean.TRUE.equals(slot.getIsBooked())) {
                throw new IllegalStateException("Bu randevu saati zaten dolu.");
            }
            if (!slot.getVetEmail().equalsIgnoreCase(appointment.getVetEmail())
                    || !slot.getDate().equals(appointment.getDate())
                    || !slot.getTime().equals(appointment.getTime())) {
                throw new IllegalArgumentException("Secilen saat randevu bilgileriyle uyusmuyor.");
            }
            slot.setIsBooked(true);
            slots.save(slot);
        }
        return appointments.save(appointment);
    }

    @Transactional
    public Appointment quote(Long id, double price) {
        Appointment appointment = get(id);
        new AppointmentContext(appointment).quote(price);
        return appointments.save(appointment);
    }

    @Transactional
    public Appointment confirm(Long id) {
        Appointment appointment = get(id);
        new AppointmentContext(appointment).confirm();
        return appointments.save(appointment);
    }

    @Transactional
    public Appointment changeStatus(Long id, String newStatus) {
        Appointment appointment = get(id);
        AppointmentContext context = new AppointmentContext(appointment);
        if ("rejected".equalsIgnoreCase(newStatus) || "cancelled".equalsIgnoreCase(newStatus)) {
            context.reject();
            releaseSlot(appointment);
        } else if ("completed".equalsIgnoreCase(newStatus)) {
            context.complete();
        } else {
            throw new IllegalArgumentException("Desteklenmeyen durum degisikligi: " + newStatus);
        }
        return appointments.save(appointment);
    }

    @Transactional
    public Appointment updateDetails(Long id, Appointment incoming) {
        Appointment appointment = get(id);
        appointment.setNotes(incoming.getNotes());
        // State and time-slot ownership are controlled by explicit domain methods.
        return appointments.save(appointment);
    }

    @Transactional
    public void delete(Long id) {
        Appointment appointment = get(id);
        releaseSlot(appointment);
        appointments.delete(appointment);
    }

    @Transactional
    public Appointment review(Long id, Appointment review) {
        Appointment appointment = get(id);
        String status = new AppointmentContext(appointment).status();
        if (!"confirmed".equals(status) && !"completed".equals(status)) {
            throw new IllegalStateException("Yalnizca onayli randevular puanlanabilir.");
        }
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Puan 1 ile 5 arasinda olmali.");
        }
        appointment.setRating(review.getRating());
        appointment.setReviewText(review.getReviewText());
        return appointments.save(appointment);
    }

    private Appointment get(Long id) {
        return appointments.findById(id).orElseThrow(() -> new NoSuchElementException("Randevu bulunamadi: " + id));
    }

    private void releaseSlot(Appointment appointment) {
        if (appointment.getAvailId() == null) return;
        slots.findForUpdate(appointment.getAvailId()).ifPresent(slot -> {
            slot.setIsBooked(false);
            slots.save(slot);
        });
    }
}
