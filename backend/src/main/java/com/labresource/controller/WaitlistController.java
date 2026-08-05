package com.labresource.controller;

import com.labresource.dto.WaitlistRequestDto;
import com.labresource.dto.WaitlistResponseDto;
import com.labresource.service.WaitlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(
            WaitlistService waitlistService
    ) {
        this.waitlistService = waitlistService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaitlistResponseDto addToWaitlist(
            @Valid @RequestBody
            WaitlistRequestDto request
    ) {

        return waitlistService.addToWaitlist(
                request
        );
    }

    @GetMapping
    public List<WaitlistResponseDto> getAllWaitlists() {

        return waitlistService.getAllWaitlists();
    }

    @GetMapping("/{waitlistId}")
    public WaitlistResponseDto getWaitlistById(
            @PathVariable String waitlistId
    ) {

        return waitlistService.getWaitlistById(
                waitlistId
        );
    }

    @GetMapping("/equipment/{equipmentId}")
    public List<WaitlistResponseDto>
    getWaitlistsByEquipment(
            @PathVariable String equipmentId
    ) {

        return waitlistService
                .getWaitlistsByEquipment(
                        equipmentId
                );
    }

    @GetMapping("/user/{userId}")
    public List<WaitlistResponseDto>
    getWaitlistsByUser(
            @PathVariable String userId
    ) {

        return waitlistService
                .getWaitlistsByUser(
                        userId
                );
    }

    @PutMapping("/{equipmentId}/allocate")
    public WaitlistResponseDto allocateNextUser(
            @PathVariable String equipmentId
    ) {

        return waitlistService
                .allocateNextUser(
                        equipmentId
                );
    }

    @PutMapping("/{waitlistId}/notify")
    public WaitlistResponseDto notifyUser(
            @PathVariable String waitlistId
    ) {

        return waitlistService
                .markAsNotified(
                        waitlistId
                );
    }

    @PutMapping("/{waitlistId}/expire")
    public WaitlistResponseDto expireEntry(
            @PathVariable String waitlistId
    ) {

        return waitlistService
                .markAsExpired(
                        waitlistId
                );
    }

    @PutMapping("/{waitlistId}/book/{bookingId}")
    public WaitlistResponseDto markAsBooked(
            @PathVariable String waitlistId,
            @PathVariable String bookingId
    ) {

        return waitlistService
                .markAsBooked(
                        waitlistId,
                        bookingId
                );
    }

    @DeleteMapping("/{waitlistId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelWaitlist(
            @PathVariable String waitlistId
    ) {

        waitlistService.cancelWaitlist(
                waitlistId
        );
    }
}