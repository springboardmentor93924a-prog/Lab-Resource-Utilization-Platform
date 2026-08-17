package com.labplatform.auth.repository;

import com.labplatform.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Find all users with a particular role belonging to an institution
    List<User> findByInstitution_IdAndRole_Name(
            Integer institutionId,
            String roleName
    );
}