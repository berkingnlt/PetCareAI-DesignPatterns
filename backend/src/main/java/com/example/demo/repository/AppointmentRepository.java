package com.example.demo.repository;

import com.example.demo.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Veteriner sisteme girdiğinde sadece KENDİ hastalarının randevularını görsün:
    List<Appointment> findByVetEmail(String vetEmail);
    
    // Müşteri sisteme girdiğinde sadece KENDİ aldığı randevuları görsün:
    List<Appointment> findByOwnerEmail(String ownerEmail);

    
    
}