package com.labresource.repository;

import com.labresource.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstitutionRepository
        extends JpaRepository<Institution, String> {

    boolean existsByEmail(String email);

    boolean existsByName(String name);
}