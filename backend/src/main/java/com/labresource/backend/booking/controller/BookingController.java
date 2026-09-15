package com.labresource.backend.booking.controller;

import com.labresource.backend.booking.dto.*;
import com.labresource.backend.booking.service.BookingAgreementService;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingAgreementService bookingAgreementService;

    @GetMapping("/agreement/current")
    public BookingAgreementDto getCurrentAgreement() {
        return bookingAgreementService.getCurrentAgreement();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BOOK_EQUIPMENT')")
    public BookingDto create(@AuthenticationPrincipal UserPrincipal principal,
                              @Valid @RequestBody BookingRequestDto request) {
        return bookingService.createBooking(principal.getUserId(), principal.getInstitutionId(), request);
    }

    @GetMapping("/my")
    public List<BookingDto> myBookings(@AuthenticationPrincipal UserPrincipal principal,
                                        @RequestParam(defaultValue = "upcoming") String tab) {
        return bookingService.myBookings(principal.getUserId(), tab);
    }

    @PutMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAuthority('CANCEL_BOOKING')")
    public BookingDto cancel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long bookingId) {
        return bookingService.cancelBooking(principal.getUserId(), bookingId);
    }

    @PutMapping("/{bookingId}/reschedule")
    @PreAuthorize("hasAuthority('RESCHEDULE_BOOKING')")
    public BookingDto reschedule(@AuthenticationPrincipal UserPrincipal principal,
                                  @PathVariable Long bookingId,
                                  @Valid @RequestBody RescheduleRequestDto request) {
        return bookingService.rescheduleBooking(principal.getUserId(), bookingId, request);
    }

    @GetMapping("/{bookingId}")
    public BookingDto getDetails(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long bookingId) {
        return bookingService.getBookingDetails(principal.getUserId(), bookingId);
    }

    @GetMapping("/{bookingId}/approval-details")
    @PreAuthorize("hasAnyAuthority('APPROVE_BOOKING', 'ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public BookingApprovalDto getApprovalDetails(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long bookingId) {
        boolean isSystemAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        return bookingService.getApprovalDetails(principal.getUserId(), principal.getDepartmentId(), principal.getInstitutionId(), isSystemAdmin, bookingId);
    }

    @GetMapping(value = "/{bookingId}/download", produces = "application/pdf")
    public org.springframework.http.ResponseEntity<byte[]> downloadPdf(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long bookingId,
            @Autowired com.labresource.backend.common.service.ReceiptPdfGeneratorService pdfGenerator,
            @Autowired com.labresource.backend.auth.repository.AppUserRepository appUserRepository,
            @Autowired com.labresource.backend.department.repository.DepartmentRepository departmentRepository,
            @Autowired com.labresource.backend.institution.repository.InstitutionRepository institutionRepository) {

        byte[] pdfBytes = bookingService.downloadBookingReceipt(principal.getUserId(), bookingId, pdfGenerator, appUserRepository, departmentRepository, institutionRepository);

        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"booking_receipt_" + bookingId + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/{bookingId}/approve")
    @PreAuthorize("hasAnyAuthority('APPROVE_BOOKING', 'ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public BookingApprovalDto approve(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long bookingId) {
        boolean isSystemAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        return bookingService.approveBooking(principal.getUserId(), principal.getDepartmentId(), principal.getInstitutionId(), isSystemAdmin, bookingId);
    }

    @PostMapping("/{bookingId}/reject")
    @PreAuthorize("hasAnyAuthority('REJECT_BOOKING', 'ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public BookingApprovalDto reject(@AuthenticationPrincipal UserPrincipal principal,
                                     @PathVariable Long bookingId,
                                     @RequestBody(required = false) BookingRejectRequestDto requestDto,
                                     @RequestParam(required = false) String reason) {
        String finalReason = (requestDto != null && requestDto.getReason() != null) ? requestDto.getReason() : reason;
        boolean isSystemAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        return bookingService.rejectBooking(principal.getUserId(), principal.getDepartmentId(), principal.getInstitutionId(), isSystemAdmin, bookingId, finalReason);
    }

    @GetMapping("/department")
    @PreAuthorize("hasAnyAuthority('APPROVE_BOOKING', 'ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public List<BookingApprovalDto> getDepartmentBookings(@AuthenticationPrincipal UserPrincipal principal,
                                                          @RequestParam(required = false) String status) {
        boolean isSystemAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        return bookingService.getDepartmentBookings(principal.getUserId(), principal.getDepartmentId(), principal.getInstitutionId(), isSystemAdmin, status);
    }
}
