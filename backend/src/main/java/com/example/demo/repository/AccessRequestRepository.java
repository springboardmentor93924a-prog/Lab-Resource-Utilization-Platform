package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.AccessRequest;

public interface AccessRequestRepository extends JpaRepository<AccessRequest, Integer> {
    List<AccessRequest> findByRequestingUser_UserId(Integer userId);
    List<AccessRequest> findByStatus(String status);
}
