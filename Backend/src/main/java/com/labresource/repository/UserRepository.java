package com.labresource.repository;

import com.labresource.entity.Role;
import com.labresource.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(
            String email
    );

    boolean existsByEmail(
            String email
    );

    List<User> findByRole(
            Role role
    );

    List<User> findByInstitutionId(
            Long institutionId
    );


    // =========================================================
    // PASSWORD RESET
    // =========================================================

    Optional<User>
    findByPasswordResetToken(
            String passwordResetToken
    );
}