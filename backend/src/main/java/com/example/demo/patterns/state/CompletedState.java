package com.example.demo.patterns.state;

// GoF State - ConcreteState: terminal, visit was completed.
public class CompletedState implements AppointmentState {
    @Override public String code() { return "completed"; }
}
