package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Institution;

public interface InstitutionRepository extends JpaRepository<Institution, Integer> {
}