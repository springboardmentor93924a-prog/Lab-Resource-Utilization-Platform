package com.example.lab_platform.repository;

import com.example.lab_platform.entity.LabLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabLocationRepository extends JpaRepository<LabLocation, Long> {
}