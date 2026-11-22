package com.example.demo.patterns.state;

// GoF State - ConcreteState: the customer confirmed the appointment.
public class ConfirmedState implements AppointmentState {
    @Override public String code() { return "confirmed"; }
    @Override public void complete(AppointmentContext context) {
        context.transitionTo(new CompletedState());
    }
}
