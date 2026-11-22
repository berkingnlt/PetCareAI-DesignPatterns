package com.example.demo.patterns.state;

// GoF State - State: all appointment states implement this contract.
public interface AppointmentState {
    String code();

    default void quote(AppointmentContext context, double price) {
        throw new IllegalStateException("Bu durumda fiyat verilemez: " + code());
    }

    default void confirm(AppointmentContext context) {
        throw new IllegalStateException("Bu durumda onay verilemez: " + code());
    }

    default void reject(AppointmentContext context) {
        throw new IllegalStateException("Bu durumda reddetme yapilamaz: " + code());
    }

    default void complete(AppointmentContext context) {
        throw new IllegalStateException("Bu durumda tamamlanamaz: " + code());
    }
}
