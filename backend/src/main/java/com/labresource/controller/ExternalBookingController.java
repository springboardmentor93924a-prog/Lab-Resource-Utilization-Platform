package com.labresource.controller;

import com.labresource.dto.ExternalBookingRequestDto;
import com.labresource.dto.ExternalBookingResponseDto;
import com.labresource.dto.ExternalBookingReviewDto;
import com.labresource.service.ExternalBookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/external-bookings")
public class ExternalBookingController {

    private final ExternalBookingService externalBookingService;

    public ExternalBookingController(
            ExternalBookingService externalBookingService
    ) {
        this.externalBookingService = externalBookingService;
    }

    @PostMapping
    public ResponseEntity<ExternalBookingResponseDto> createExternalBooking(
            @Valid @RequestBody ExternalBookingRequestDto requestDto
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        externalBookingService.createExternalBooking(
                                requestDto
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getAllExternalBookings() {

        return ResponseEntity.ok(
                externalBookingService.getAllExternalBookings()
        );
    }

    @GetMapping("/{externalBookingId}")
    public ResponseEntity<ExternalBookingResponseDto>
    getExternalBookingById(
            @PathVariable String externalBookingId
    ) {

        return ResponseEntity.ok(
                externalBookingService.getExternalBookingById(
                        externalBookingId
                )
        );
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getBookingsByEquipment(
            @PathVariable String equipmentId
    ) {

        return ResponseEntity.ok(
                externalBookingService.getBookingsByEquipment(
                        equipmentId
                )
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getBookingsByUser(
            @PathVariable String userId
    ) {

        return ResponseEntity.ok(
                externalBookingService.getBookingsByUser(
                        userId
                )
        );
    }

    @GetMapping("/requesting-institution/{institutionId}")
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getBookingsByRequestingInstitution(
            @PathVariable String institutionId
    ) {

        return ResponseEntity.ok(
                externalBookingService
                        .getBookingsByRequestingInstitution(
                                institutionId
                        )
        );
    }

    @GetMapping("/provider-institution/{institutionId}")
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getBookingsByProviderInstitution(
            @PathVariable String institutionId
    ) {

        return ResponseEntity.ok(
                externalBookingService
                        .getBookingsByProviderInstitution(
                                institutionId
                        )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getBookingsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                externalBookingService.getBookingsByStatus(
                        status
                )
        );
    }

    @GetMapping("/provider/{institutionId}/status/{status}")
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getProviderBookingsByStatus(
            @PathVariable String institutionId,
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                externalBookingService
                        .getProviderBookingsByStatus(
                                institutionId,
                                status
                        )
        );
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ExternalBookingResponseDto>>
    getBookingsByDateRange(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startTime,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endTime
    ) {

        return ResponseEntity.ok(
                externalBookingService.getBookingsByDateRange(
                        startTime,
                        endTime
                )
        );
    }

    @PutMapping("/{externalBookingId}/review")
    public ResponseEntity<ExternalBookingResponseDto>
    reviewExternalBooking(

            @PathVariable String externalBookingId,

            @Valid
            @RequestBody
            ExternalBookingReviewDto reviewDto
    ) {

        return ResponseEntity.ok(
                externalBookingService.reviewExternalBooking(
                        externalBookingId,
                        reviewDto
                )
        );
    }

    @PutMapping("/{externalBookingId}/cancel")
    public ResponseEntity<ExternalBookingResponseDto>
    cancelExternalBooking(

            @PathVariable String externalBookingId,

            @RequestParam String userId
    ) {

        return ResponseEntity.ok(
                externalBookingService.cancelExternalBooking(
                        externalBookingId,
                        userId
                )
        );
    }

    @PutMapping("/{externalBookingId}/complete")
    public ResponseEntity<ExternalBookingResponseDto>
    completeExternalBooking(
            @PathVariable String externalBookingId
    ) {

        return ResponseEntity.ok(
                externalBookingService.completeExternalBooking(
                        externalBookingId
                )
        );
    }

    @DeleteMapping("/{externalBookingId}")
    public ResponseEntity<Void> deleteExternalBooking(
            @PathVariable String externalBookingId
    ) {

        externalBookingService.deleteExternalBooking(
                externalBookingId
        );

        return ResponseEntity.noContent().build();
    }
}