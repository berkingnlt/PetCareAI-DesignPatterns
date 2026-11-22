package com.example.demo.repository;

import com.example.demo.model.Availability;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByVetEmail(String vetEmail);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Availability s where s.id = :id")
    Optional<Availability> findForUpdate(@Param("id") Long id);
}
