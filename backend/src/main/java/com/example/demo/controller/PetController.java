package com.example.demo.controller; 
import com.example.demo.model.Pet;
import com.example.demo.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets") 
@CrossOrigin("*") 
public class PetController {

    @Autowired
    private PetRepository petRepository;

    //  TÜM HAYVANLARI GETİR (Bunu veteriner paneli için kullanıyoruz)
    @GetMapping
    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    //  SADECE BELİRLİ BİR KİŞİNİN HAYVANLARINI GETİR (Kullanıcı kendi paneline girince çalışacak)
    @GetMapping("/owner/{email}")
    public List<Pet> getPetsByOwner(@PathVariable String email) {
        return petRepository.findByOwnerEmail(email); 
    }

    //  YENİ EVCİL HAYVAN EKLE (Frontend'den form doldurulunca buraya gelecek)
    @PostMapping
    public Pet addPet(@RequestBody Pet pet) {
        return petRepository.save(pet);
    }

    //  HAYVAN SİL (Olur da kullanıcı yanlışlıkla eklerse silme butonu için)
    @DeleteMapping("/{id}")
    public void deletePet(@PathVariable Long id) {
        petRepository.deleteById(id);
    }

@GetMapping("/{id}")
public Pet getPetById(@PathVariable Long id) {
    return petRepository.findById(id).orElseThrow(() -> new RuntimeException("Hayvan bulunamadı!"));
}

@PutMapping("/{id}")
    public ResponseEntity<Pet> updatePet(@PathVariable Long id, @RequestBody Pet updatedPet) {
        //  Veritabanından o anki hayvanı bul
        Pet existingPet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evcil hayvan bulunamadı!"));

        //  Frontend'den gelen yeni verileri eski kaydın üzerine yaz
        existingPet.setAge(updatedPet.getAge());
        existingPet.setBreed(updatedPet.getBreed());
        
        existingPet.setVaccines(updatedPet.getVaccines()); 

        //  Güncellenmiş haliyle MariaDB'ye kaydet
        Pet savedPet = petRepository.save(existingPet);
        return ResponseEntity.ok(savedPet);
    }

}
