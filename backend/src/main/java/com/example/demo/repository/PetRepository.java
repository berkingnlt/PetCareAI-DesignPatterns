package com.example.demo.repository;

import com.example.demo.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {
    
    // Müşteri sisteme girdiğinde sadece KENDİ hayvanlarını görsün 
    List<Pet> findByOwnerEmail(String ownerEmail);
    
}