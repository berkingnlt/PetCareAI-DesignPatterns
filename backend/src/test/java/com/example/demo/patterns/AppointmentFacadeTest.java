package com.example.demo.patterns;

import com.example.demo.model.Appointment;
import com.example.demo.model.Availability;
import com.example.demo.patterns.facade.AppointmentFacade;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.AvailabilityRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AppointmentFacadeTest {
    @Test void bookingReservesSlot() {
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        AvailabilityRepository slots = mock(AvailabilityRepository.class);
        AppointmentFacade facade = new AppointmentFacade(appointments, slots);
        Availability slot = new Availability();
        slot.setId(6L); slot.setVetEmail("vet@example.test");
        slot.setDate("2026-11-23"); slot.setTime("12:00"); slot.setIsBooked(false);
        when(slots.findForUpdate(6L)).thenReturn(Optional.of(slot));
        when(appointments.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));
        Appointment booking = new Appointment();
        booking.setAvailId(6L); booking.setVetEmail("vet@example.test");
        booking.setDate("2026-11-23"); booking.setTime("12:00");
        assertEquals("pending", facade.create(booking).getStatus());
        assertTrue(slot.getIsBooked());
        verify(slots).save(slot);
    }

    @Test void alreadyBookedSlotIsRejected() {
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        AvailabilityRepository slots = mock(AvailabilityRepository.class);
        Availability slot = new Availability();
        slot.setIsBooked(true);
        when(slots.findForUpdate(6L)).thenReturn(Optional.of(slot));
        Appointment booking = new Appointment(); booking.setAvailId(6L);
        assertThrows(IllegalStateException.class, () -> new AppointmentFacade(appointments, slots).create(booking));
        verify(appointments, never()).save(any(Appointment.class));
    }

    @Test void rejectedAppointmentReleasesSlot() {
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        AvailabilityRepository slots = mock(AvailabilityRepository.class);
        Appointment booking = new Appointment(); booking.setId(7L);
        booking.setStatus("quoted"); booking.setAvailId(6L);
        Availability slot = new Availability(); slot.setIsBooked(true);
        when(appointments.findById(7L)).thenReturn(Optional.of(booking));
        when(slots.findForUpdate(6L)).thenReturn(Optional.of(slot));
        when(appointments.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));
        new AppointmentFacade(appointments, slots).changeStatus(7L, "rejected");
        assertEquals("rejected", booking.getStatus());
        assertFalse(slot.getIsBooked());
    }
}
