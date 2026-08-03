package com.example.lab_platform.repository;

import com.example.lab_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Login aur Email Validation ke liye zaroori query
    Optional<User> findByEmail(String email);

    // Duplicate email check karne ke liye helper method
    Boolean existsByEmail(String email);
}
