package com.example.demo.patterns.state;

// GoF State - ConcreteState: an appointment waiting for the vet's price.
public class PendingState implements AppointmentState {
    @Override public String code() { return "pending"; }
    @Override public void quote(AppointmentContext context, double price) {
        if (!Double.isFinite(price) || price <= 0) throw new IllegalArgumentException("Fiyat pozitif olmali.");
        context.getAppointment().setPrice(price);
        context.transitionTo(new QuotedState());
    }
    @Override public void reject(AppointmentContext context) {
        context.transitionTo(new RejectedState());
    }
}
