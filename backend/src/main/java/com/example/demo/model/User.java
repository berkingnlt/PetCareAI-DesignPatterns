package com.example.demo.model; 

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
    
    private String photo;

    @Column(nullable = false)
    private String role; 



    private String status; 
    
    // --- KLİNİK ÖZELLİKLERİ ---
    private String clinicName;
    private String city;
    private String district;
    private Integer availableBeds;
    
    // --- VETERİNER ÖZELLİKLERİ ---
    private String experience; 
    private String clinicEmail; 
    
    @Column(length = 1000) 
    private String bio;

    private Integer bedCapacity;
    private Boolean emergency;
    private String clinicPhoto;

    // --- YATAK KAPASİTESİ GET/SET ---
    public Integer getBedCapacity() {
        return bedCapacity;
    }

    public void setBedCapacity(Integer bedCapacity) {
        this.bedCapacity = bedCapacity;
    }

    // KLİNİK FOTOĞRAFI GET/SET 
    public String getClinicPhoto() {
        return clinicPhoto;
    }

    public void setClinicPhoto(String clinicPhoto) {
        this.clinicPhoto = clinicPhoto;
    }

    // --- ACİL DURUM GET/SET (Artık "is" değil "get" kullanıyoruz) ---
    public Boolean getEmergency() {
        return emergency;
    }

    public void setEmergency(Boolean emergency) {
        this.emergency = emergency;
    }
} 