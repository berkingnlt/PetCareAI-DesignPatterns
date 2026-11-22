package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vetEmail;
    private String ownerEmail;
    private String ownerName;
    private String petName;
    private String date;
    private String time;
    private String notes;
    private String status; 
    private Long availId; 
    private Double price;
    private Integer rating; 
    private String reviewText; 

    // --- GETTER VE SETTER METOTLARI ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVetEmail() { return vetEmail; }
    public void setVetEmail(String vetEmail) { this.vetEmail = vetEmail; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAvailId() { return availId; }
    public void setAvailId(Long availId) { this.availId = availId; }

    public Double getPrice() {
    return price; 
}

public void setPrice(Double price) {
    this.price = price;
}

public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    } 
}