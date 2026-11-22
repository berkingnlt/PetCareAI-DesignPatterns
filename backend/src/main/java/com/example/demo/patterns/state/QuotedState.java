package com.example.demo.patterns.state;

// GoF State - ConcreteState: price was sent to the customer.
public class QuotedState implements AppointmentState {
    @Override public String code() { return "quoted"; }
    @Override public void confirm(AppointmentContext context) {
        context.transitionTo(new ConfirmedState());
    }
    @Override public void reject(AppointmentContext context) {
        context.transitionTo(new RejectedState());
    }
}
