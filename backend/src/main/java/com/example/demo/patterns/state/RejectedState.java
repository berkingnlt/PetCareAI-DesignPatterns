package com.example.demo.patterns.state;

// GoF State - ConcreteState: terminal, slot can be released.
public class RejectedState implements AppointmentState {
    @Override public String code() { return "rejected"; }
}
