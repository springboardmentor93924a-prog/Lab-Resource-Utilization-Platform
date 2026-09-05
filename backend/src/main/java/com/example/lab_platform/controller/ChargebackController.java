package com.example.lab_platform.controller;

import com.example.lab_platform.dto.ChargebackDTO;
import com.example.lab_platform.dto.DisputeRequestDTO;
import com.example.lab_platform.service.ChargebackService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chargebacks")
public class ChargebackController {

    private static final String MANAGER_ROLES = """
        hasAnyRole(
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """;

    private final ChargebackService chargebackService;

    public ChargebackController(ChargebackService chargebackService) {
        this.chargebackService = chargebackService;
    }

    @GetMapping
    @PreAuthorize(MANAGER_ROLES)
    public List<ChargebackDTO> getAllChargebacks() {
        return chargebackService.getAllChargebacks();
    }

    @PostMapping("/generate")
    @PreAuthorize(MANAGER_ROLES)
    public Map<String, Object> generate() {
        int created = chargebackService.generateChargebacks();
        return Map.of(
                "generated", created,
                "message", created > 0
                        ? created + " new chargeback request(s) generated."
                        : "No new chargebacks to generate - already up to date.");
    }

    @PutMapping("/{chargebackId}/approve")
    @PreAuthorize(MANAGER_ROLES)
    public ChargebackDTO approve(@PathVariable Integer chargebackId) {
        return chargebackService.approve(chargebackId);
    }

    @PutMapping("/{chargebackId}/dispute")
    @PreAuthorize(MANAGER_ROLES)
    public ChargebackDTO dispute(
            @PathVariable Integer chargebackId,
            @RequestBody DisputeRequestDTO request) {
        return chargebackService.dispute(chargebackId, request.getRemarks());
    }

    @PutMapping("/{chargebackId}/settle")
    @PreAuthorize(MANAGER_ROLES)
    public ChargebackDTO settle(@PathVariable Integer chargebackId) {
        return chargebackService.settle(chargebackId);
    }
}