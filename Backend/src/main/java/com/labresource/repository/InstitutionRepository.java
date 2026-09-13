package com.labresource.repository;

import com.labresource.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionRepository
        extends JpaRepository<Institution, Long> {

    List<Institution> findByActiveTrue();

    Optional<Institution> findByNameIgnoreCase(String name);
}