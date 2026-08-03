package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.entity.Institution;
import com.labplatform.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    // Public — used by the registration form to list institutions before login
    @GetMapping("/api/public/institutions")
    public List<Institution> publicList() {
        return institutionRepository.findAll();
    }

    @GetMapping("/api/institutions")
    public ResponseEntity<ApiResponse<List<Institution>>> all() {
        return ResponseEntity.ok(ApiResponse.ok(institutionRepository.findAll()));
    }

    @PostMapping("/api/institutions")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Institution>> create(@RequestBody Institution institution) {
        return ResponseEntity.ok(ApiResponse.ok(institutionRepository.save(institution)));
    }
}
