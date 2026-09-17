package com.infosys.labresource.EquipmentUtilization.Controller;

import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationAnalyticsDTO;
import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationResponseDTO;
import com.infosys.labresource.EquipmentUtilization.Service.UtilizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilization")
@RequiredArgsConstructor
public class Utilizationcontroller {
    private final UtilizationService utilService;

    @PostMapping("/start/{bookingId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<UtilizationResponseDTO> startUtilization(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(utilService.startUtilization(bookingId));
    }

    @PutMapping("/end/{bookingId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<UtilizationResponseDTO> endUtilization(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(utilService.endUtilization(bookingId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<List<UtilizationResponseDTO>> getAllUtilization(Authentication auth) {

        return ResponseEntity.ok(utilService.getAllUtilization(auth.getName()));
    }
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<List<UtilizationAnalyticsDTO>> getUtilizationAnalytics(Authentication auth) {

        return ResponseEntity.ok(utilService.getUtilizationAnalytics(auth.getName()));
    }

    @GetMapping("/{utilizationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilizationResponseDTO> getUtilizationById(
            @PathVariable Long utilizationId, Authentication auth) {

        return ResponseEntity.ok(utilService.getUtilizationById(utilizationId, auth.getName()));
    }

}
