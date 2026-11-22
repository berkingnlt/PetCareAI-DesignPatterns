package com.example.demo.patterns.strategy;

import com.example.demo.model.Appointment;
import com.example.demo.model.User;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClinicRankingService {
    private final UserRepository users;
    private final AppointmentRepository appointments;
    public ClinicRankingService(UserRepository users, AppointmentRepository appointments) {
        this.users = users; this.appointments = appointments;
    }

    public List<String> clinicEmailsBy(String sortMode) {
        List<User> allUsers = users.findAll();
        Map<String, String> vetClinicByEmail = allUsers.stream()
            .filter(u -> "vet".equals(u.getRole()) && "approved".equals(u.getStatus()))
            .filter(u -> u.getEmail() != null && u.getClinicEmail() != null)
            .collect(Collectors.toMap(User::getEmail, User::getClinicEmail, (first, second) -> first));
        Map<String, int[]> ratingTotals = new HashMap<>();
        for (Appointment a : appointments.findAll()) {
            if (a.getRating() == null || a.getRating() < 1 || a.getRating() > 5) continue;
            String clinicEmail = vetClinicByEmail.get(a.getVetEmail());
            if (clinicEmail != null) {
                int[] counter = ratingTotals.computeIfAbsent(clinicEmail, unused -> new int[2]);
                counter[0] += a.getRating(); counter[1]++;
            }
        }
        List<ClinicRanking> data = allUsers.stream()
            .filter(u -> "clinic".equals(u.getRole()) && "approved".equals(u.getStatus()) && u.getEmail() != null)
            .map(u -> {
                int[] totals = ratingTotals.getOrDefault(u.getEmail(), new int[2]);
                String name = u.getClinicName() != null ? u.getClinicName() : u.getName();
                return new ClinicRanking(u.getEmail(), name == null ? "" : name,
                    totals[1] == 0 ? 0 : (double) totals[0] / totals[1], totals[1]);
            }).toList();
        ClinicSortingStrategy selected = switch (sortMode == null ? "" : sortMode.toLowerCase()) {
            case "rating" -> new RatingClinicSortStrategy();
            case "reviews" -> new ReviewCountClinicSortStrategy();
            case "name" -> new NameClinicSortStrategy();
            default -> throw new IllegalArgumentException("Siralama turu: name, rating veya reviews olmali.");
        };
        return new ClinicSortingContext(selected).sort(data).stream().map(ClinicRanking::email).toList();
    }
}
