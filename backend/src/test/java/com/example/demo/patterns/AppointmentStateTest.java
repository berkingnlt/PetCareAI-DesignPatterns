package com.example.demo.patterns;

import com.example.demo.model.Appointment;
import com.example.demo.patterns.state.AppointmentContext;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AppointmentStateTest {
    @Test void validFlowGoesFromPendingToQuotedToConfirmedToCompleted() {
        Appointment a = new Appointment();
        a.setStatus("pending");
        AppointmentContext context = new AppointmentContext(a);
        context.quote(250);
        assertEquals("quoted", a.getStatus());
        assertEquals(250.0, a.getPrice());
        context.confirm();
        assertEquals("confirmed", a.getStatus());
        context.complete();
        assertEquals("completed", a.getStatus());
    }

    @Test void invalidTransitionsAreRejected() {
        Appointment a = new Appointment();
        a.setStatus("pending");
        AppointmentContext context = new AppointmentContext(a);
        assertThrows(IllegalStateException.class, context::confirm);
        assertThrows(IllegalArgumentException.class, () -> context.quote(-1));
        context.reject();
        assertEquals("rejected", a.getStatus());
        assertThrows(IllegalStateException.class, () -> context.quote(100));
    }
}
