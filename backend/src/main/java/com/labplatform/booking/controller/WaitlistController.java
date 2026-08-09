package com.labplatform.booking.controller;

import com.labplatform.booking.dto.WaitlistJoinRequest;
import com.labplatform.booking.dto.WaitlistResponse;
import com.labplatform.booking.service.WaitlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @PostMapping
    public ResponseEntity<WaitlistResponse> joinWaitlist(@Valid @RequestBody WaitlistJoinRequest request,
                                                         Authentication authentication) {
        WaitlistResponse response = waitlistService.joinWaitlist(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<WaitlistResponse>> getMyWaitlistEntries(Authentication authentication) {
        return ResponseEntity.ok(waitlistService.getMyWaitlistEntries(authentication.getName()));
    }
}