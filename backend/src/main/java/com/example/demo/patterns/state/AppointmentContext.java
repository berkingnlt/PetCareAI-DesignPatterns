package com.example.demo.patterns.state;

import com.example.demo.model.Appointment;

// GoF State - Context: delegates requests to the active concrete state.
public class AppointmentContext {
    private final Appointment appointment;
    private AppointmentState state;

    public AppointmentContext(Appointment appointment) {
        this.appointment = appointment;
        this.state = resolve(appointment.getStatus());
    }

    public void transitionTo(AppointmentState next) {
        state = next;
        appointment.setStatus(next.code());
    }

    public Appointment getAppointment() { return appointment; }
    public String status() { return state.code(); }
    public void quote(double price) { state.quote(this, price); }
    public void confirm() { state.confirm(this); }
    public void reject() { state.reject(this); }
    public void complete() { state.complete(this); }

    private AppointmentState resolve(String status) {
        if (status == null || status.isBlank() || "pending".equalsIgnoreCase(status)) return new PendingState();
        return switch (status.toLowerCase()) {
            case "quoted" -> new QuotedState();
            case "confirmed" -> new ConfirmedState();
            case "rejected", "cancelled" -> new RejectedState();
            case "completed" -> new CompletedState();
            default -> throw new IllegalArgumentException("Bilinmeyen randevu durumu: " + status);
        };
    }
}
