package com.labresource.controller;

import com.labresource.dto.BookingOptimizationResponseDto;
import com.labresource.service.BookingOptimizationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/booking-optimization")
public class BookingOptimizationController {

    private final BookingOptimizationService bookingOptimizationService;

    public BookingOptimizationController(
            BookingOptimizationService bookingOptimizationService
    ) {
        this.bookingOptimizationService =
                bookingOptimizationService;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<BookingOptimizationResponseDto>
    getOptimizedBookingSuggestions(

            @RequestParam String equipmentId,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime requestedStartTime,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime requestedEndTime
    ) {

        BookingOptimizationResponseDto response =
                bookingOptimizationService
                        .getOptimizedBookingSuggestions(
                                equipmentId,
                                requestedStartTime,
                                requestedEndTime
                        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/availability")
    public ResponseEntity<Boolean>
    checkEquipmentAvailability(

            @RequestParam String equipmentId,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime requestedStartTime,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime requestedEndTime
    ) {

        boolean available =
                bookingOptimizationService
                        .isEquipmentAvailableForSlot(
                                equipmentId,
                                requestedStartTime,
                                requestedEndTime
                        );

        return ResponseEntity.ok(available);
    }
}