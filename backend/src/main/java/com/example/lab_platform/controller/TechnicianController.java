package com.example.lab_platform.controller;

import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.UserRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/technician")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class TechnicianController {

    private final UserRepository userRepository;

    public TechnicianController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Lab Technicians in the caller's own institution — feeds the
    // "Assign Technician" dropdown on the Maintenance page. Trimmed to
    // match Maintenance page access (Lab Technician/System Admin
    // untouched, Department Head and Institution Admin no longer have
    // a Maintenance page to assign work orders from).
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'SYSTEM_ADMIN')")
    public List<User> listTechnicians() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        User loggedInUser = (User) authentication.getPrincipal();

        Integer institutionId = loggedInUser.getInstitution() != null
                ? loggedInUser.getInstitution().getInstitutionId()
                : null;

        if (institutionId == null) {
            return List.of();
        }

        return userRepository.findByRole_RoleNameAndInstitution_InstitutionId(
                "LAB_TECHNICIAN", institutionId);
    }
}