package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Waitlist;
import com.example.lab_platform.service.WaitlistService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    // =========================================================
    // JOIN WAITLIST
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
    """)
    @PostMapping
    public ResponseEntity<Waitlist> joinWaitlist(
            @RequestBody Waitlist waitlist) {

        return ResponseEntity.ok(
                waitlistService.joinWaitlist(waitlist)
        );
    }

    // =========================================================
    // GET ALL WAITLIST ENTRIES — per PDF Section 11, the Waitlist nav
    // item belongs to Researcher/Student only. Lab Technician's extra
    // access is trimmed here too now (System Admin kept as the sole
    // staff fallback).
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'SYSTEM_ADMIN'
        )
    """)
    @GetMapping
    public ResponseEntity<List<Waitlist>> getAllWaitlistEntries() {

        return ResponseEntity.ok(
                waitlistService.getAllWaitlistEntries()
        );
    }

    // =========================================================
    // GET WAITLIST FOR A SPECIFIC EQUIPMENT — same trim as above.
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'SYSTEM_ADMIN'
        )
    """)
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<Waitlist>> getWaitlistForEquipment(
            @PathVariable Integer equipmentId) {

        return ResponseEntity.ok(
                waitlistService.getWaitlistForEquipment(equipmentId)
        );
    }

    // =========================================================
    // GET MY OWN WAITLIST ENTRIES
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
    """)
    @GetMapping("/my")
    public ResponseEntity<List<Waitlist>> getMyWaitlistEntries() {

        return ResponseEntity.ok(
                waitlistService.getMyWaitlistEntries()
        );
    }

    // =========================================================
    // CANCEL WAITLIST ENTRY
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
    """)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelWaitlistEntry(
            @PathVariable Integer id) {

        waitlistService.cancelWaitlistEntry(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // DECIDE ON A MISSED WINDOW (the two-button response to the
    // "couldn't allocate your slot" notification)
    // Body: { "decision": "REBOOK" } or { "decision": "EXIT" }
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
    """)
    @PostMapping("/{id}/decide")
    public ResponseEntity<Waitlist> decideOnMissedWindow(
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body) {

        return ResponseEntity.ok(
                waitlistService.decideOnMissedWindow(id, body.get("decision"))
        );
    }
}