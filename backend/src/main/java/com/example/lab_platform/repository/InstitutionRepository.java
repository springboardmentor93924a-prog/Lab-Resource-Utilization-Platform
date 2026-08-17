package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstitutionRepository
        extends JpaRepository<Institution, Integer> {

    boolean existsByInstitutionNameIgnoreCase(
            String institutionName);
}