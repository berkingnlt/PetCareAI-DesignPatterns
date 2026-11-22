package com.example.demo.controller; 

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController 
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") 
public class UserController {

    @Autowired
    private UserRepository userRepository; 

    //  TÜM KULLANICILARI GETİR (GET İsteği)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll(); 
    }

    // YENİ KULLANICI KAYDET / KAYIT OL (POST İsteği)
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    //  GİRİŞ YAP / LOGIN (POST İsteği)
    @PostMapping("/login")
    public User loginUser(@RequestBody User loginRequest) {
        // E-postaya göre adamı bul
        Optional<User> existingUser = userRepository.findByEmail(loginRequest.getEmail());
        
        // Adam var mı ve şifresi doğru mu kontrol et
        if (existingUser.isPresent() && existingUser.get().getPassword().equals(loginRequest.getPassword())) {
            return existingUser.get(); 
        } else {
            throw new RuntimeException("Hatalı e-posta veya şifre!"); 
        }
    }

    // 4. VETERİNER ONAYLA VEYA REDDET 
    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestParam String newStatus) {
        //  Veritabanından o ID'ye sahip adamı bul
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        //  Eğer klinik reddet butonuna bastıysa, veterineri sistemden sil (Çöp tenekesine yolla)
        if ("rejected".equals(newStatus)) {
            userRepository.delete(user);
            return ResponseEntity.ok().build(); // Başarıyla silindi mesajı dön
        }
        
        //  Eğer onayladıysa, statüsünü "approved" yap ve veritabanını güncelle
        user.setStatus(newStatus);
        return ResponseEntity.ok(userRepository.save(user));
    }

    //  PROFİL BİLGİLERİNİ GÜNCELLE
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserProfile(@PathVariable Long id, @RequestBody User updatedUser) {
        // Veritabanından mevcut kullanıcıyı bul
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Güncellenen alanları mevcut kullanıcıya kopyala
        // (E-posta ve ID gibi değiştirilemez alanları koruyoruz)
        existingUser.setName(updatedUser.getName());
         existingUser.setPhone(updatedUser.getPhone());
        existingUser.setPassword(updatedUser.getPassword());
        existingUser.setPhoto(updatedUser.getPhoto());

      // Kliniğe özel alanlar
        if (existingUser.getRole().equals("clinic")) {
            existingUser.setClinicName(updatedUser.getClinicName());
            existingUser.setClinicPhoto(updatedUser.getClinicPhoto());
            existingUser.setCity(updatedUser.getCity());
            existingUser.setDistrict(updatedUser.getDistrict());
            existingUser.setBedCapacity(updatedUser.getBedCapacity());
            
            // isEmergency() yerine getEmergency() yazıyoruz!
            existingUser.setEmergency(updatedUser.getEmergency());
        }

        // Veterinere özel alanlar
        if (existingUser.getRole().equals("vet")) {
            existingUser.setExperience(updatedUser.getExperience());
            existingUser.setBio(updatedUser.getBio());
        }

        // Kaydet ve geri dön
        User savedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(savedUser);
    }
    
}