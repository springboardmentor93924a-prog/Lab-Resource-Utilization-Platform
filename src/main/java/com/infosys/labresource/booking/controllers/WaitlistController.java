package com.infosys.labresource.booking.controllers;

import com.infosys.labresource.booking.dtos.WaitlistResponseDTO;
import com.infosys.labresource.booking.service.WaitlistServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {
    private final WaitlistServiceImpl waitlistService;

    @GetMapping
    public ResponseEntity<List<WaitlistResponseDTO>> getAllWaitlistEntries() {

        return ResponseEntity.ok(waitlistService.getAllWaitlistEntries());
    }

    @GetMapping("/{waitlistId}")
    public ResponseEntity<WaitlistResponseDTO> getWaitlistById(@PathVariable Long waitlistId) {
        return ResponseEntity.ok(waitlistService.getWaitlistById(waitlistId));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<WaitlistResponseDTO>> getWaitlistByEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(waitlistService.getWaitlistByEquipment(equipmentId));
    }
}
