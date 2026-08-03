package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.dto.BookingRequest;
import com.labplatform.entity.Booking;
import com.labplatform.entity.BookingStatus;
import com.labplatform.entity.User;
import com.labplatform.service.BookingService;
import com.labplatform.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> create(@RequestBody BookingRequest req) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Booking request submitted", bookingService.create(user, req)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Booking>>> myBookings() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(bookingService.forUser(user.getId())));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<List<Booking>>> forEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.forEquipment(equipmentId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER','LAB_TECHNICIAN','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<Booking>>> all(@RequestParam(required = false) BookingStatus status) {
        List<Booking> bookings = (status != null) ? bookingService.byStatus(status) : bookingService.all();
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking approved", bookingService.approve(id, SecurityUtil.getCurrentUser())));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking rejected", bookingService.reject(id, SecurityUtil.getCurrentUser())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled", bookingService.cancel(id, SecurityUtil.getCurrentUser())));
    }

    @PatchMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','RESEARCHER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Checked in", bookingService.checkIn(id)));
    }

    @PatchMapping("/{id}/check-out")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','RESEARCHER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Checked out", bookingService.checkOut(id)));
    }

    @PatchMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> noShow(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Marked as no-show", bookingService.markNoShow(id)));
    }
}
