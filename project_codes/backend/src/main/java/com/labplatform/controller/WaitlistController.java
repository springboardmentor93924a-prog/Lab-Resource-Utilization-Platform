package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.entity.User;
import com.labplatform.entity.Waitlist;
import com.labplatform.service.WaitlistService;
import com.labplatform.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    @PostMapping
    public ResponseEntity<ApiResponse<Waitlist>> join(@RequestParam Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desiredStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desiredEnd) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Added to waitlist", waitlistService.join(user, equipmentId, desiredStart, desiredEnd)));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<List<Waitlist>>> forEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(waitlistService.forEquipment(equipmentId)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Waitlist>>> mine() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(waitlistService.forUser(user.getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> leave(@PathVariable Long id) {
        waitlistService.leave(id);
        return ResponseEntity.ok(ApiResponse.ok("Removed from waitlist", null));
    }
}
