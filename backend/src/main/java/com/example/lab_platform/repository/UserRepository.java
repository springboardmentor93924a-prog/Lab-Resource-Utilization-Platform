package com.example.lab_platform.repository;

import com.example.lab_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // लॉगिन या ऑथेंटिकेशन के समय यूजरनेम से यूजर को ढूंढने के लिए
    Optional<User> findByUsername(String username);
}