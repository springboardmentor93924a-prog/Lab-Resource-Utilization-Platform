package com.labresource.backend.booking.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.booking.dto.BookingApprovalDto;
import com.labresource.backend.booking.dto.BookingDto;
import com.labresource.backend.booking.dto.BookingRequestDto;
import com.labresource.backend.booking.dto.RescheduleRequestDto;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.service.EquipmentService;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EquipmentService equipmentService;
    private final NotificationService notificationService;
    private final BookingAgreementService bookingAgreementService;
    private final AppUserRepository appUserRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final com.labresource.backend.waitlist.service.WaitlistService waitlistService;
    private final com.labresource.backend.sharing.service.SharingService sharingService;
    private final com.labresource.backend.sharing.repository.SharedBookingRepository sharedBookingRepository;

    private static final List<String> UPCOMING_STATUSES = List.of(Booking.PENDING_APPROVAL, Booking.CONFIRMED);
    private static final List<String> ACTIVE_STATUSES = List.of(Booking.IN_USE);
    private static final List<String> HISTORY_STATUSES = List.of(Booking.COMPLETED, Booking.CANCELLED, Booking.REJECTED, Booking.NO_SHOW);

    @Transactional
    public BookingDto createBooking(Long userId, Long institutionId, BookingRequestDto request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }

        if (!Boolean.TRUE.equals(request.getAgreementAccepted())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You must accept the laboratory safety and usage agreement to submit a booking.");
        }

        Equipment equipment = equipmentService.getEntity(request.getEquipmentId());

        // Check 1: equipment must be AVAILABLE
        if (!Equipment.AVAILABLE.equals(equipment.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "This equipment is not currently available for booking.");
        }

        // Check 2: no overlapping bookings
        List<Booking> overlaps = bookingRepository.findOverlapping(
                equipment.getEquipmentId(), request.getStartTime(), request.getEndTime(), null);
        if (!overlaps.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This time slot conflicts with an existing booking. Please choose another time or join the waitlist.");
        }

        // Check 3: valid (non-expired) calibration must exist
        if (!equipmentService.hasValidCalibration(equipment.getEquipmentId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This equipment does not have a valid calibration on record and cannot be booked right now.");
        }

        // Check 4: no active (non-completed/cancelled) maintenance request
        boolean hasActiveMaintenance = maintenanceRequestRepository
                .findByEquipmentIdAndStatusNot(equipment.getEquipmentId(), MaintenanceRequest.COMPLETED)
                .stream()
                .anyMatch(m -> !MaintenanceRequest.CANCELLED.equals(m.getStatus()));
        if (hasActiveMaintenance) {
            throw new ApiException(HttpStatus.CONFLICT, "This equipment has an open maintenance request and cannot be booked right now.");
        }

        // Check 5: Inter-institution sharing validation
        if (!equipment.getInstitutionId().equals(institutionId)) {
            List<com.labresource.backend.sharing.entity.SharingAgreement> agreements = sharingService.getActiveAgreements(
                    equipment.getEquipmentId(), request.getStartTime().toLocalDate());

            com.labresource.backend.sharing.entity.SharingAgreement activeAgreement = agreements.stream()
                    .filter(a -> a.getRequestingInstitutionId().equals(institutionId))
                    .findFirst()
                    .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT,
                            "No active sharing agreement exists between your institution and the equipment's owning institution for these dates."));

            if (request.getEndTime().toLocalDate().isAfter(activeAgreement.getEndDate())) {
                throw new ApiException(HttpStatus.CONFLICT, "The requested booking window extends beyond the sharing agreement end date: " + activeAgreement.getEndDate());
            }
        }

        Booking booking = new Booking();
        booking.setEquipmentId(equipment.getEquipmentId());
        booking.setUserId(userId);
        booking.setInstitutionId(institutionId);
        booking.setDepartmentId(equipment.getDepartmentId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus(Booking.PENDING_APPROVAL);
        booking.setPurpose(request.getPurpose());
        booking.setIsRecurring(Boolean.TRUE.equals(request.getIsRecurring()));
        booking.setRecurrencePattern(request.getRecurrencePattern());

        // Persist real agreement acceptance
        String agreedVersion = (request.getAgreementVersion() != null && !request.getAgreementVersion().isBlank())
                ? request.getAgreementVersion().trim()
                : bookingAgreementService.getCurrentVersion();
        booking.setAgreementAccepted(true);
        booking.setAgreementVersion(agreedVersion);
        booking.setAgreementAcceptedAt(LocalDateTime.now());

        double hours = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes() / 60.0;
        BigDecimal hourlyRate = equipment.getHourlyRate();
        if (hourlyRate != null) {
            booking.setEstimatedCost(hourlyRate.multiply(BigDecimal.valueOf(hours)));
            booking.setPaymentStatus("PENDING");
        } else {
            booking.setEstimatedCost(BigDecimal.ZERO);
            booking.setPaymentStatus("NOT_APPLICABLE");
        }
        booking.setActualCost(BigDecimal.ZERO);

        Booking saved = bookingRepository.save(booking);

        if (!equipment.getInstitutionId().equals(institutionId)) {
            com.labresource.backend.sharing.entity.SharingAgreement activeAgreement = sharingService.getActiveAgreements(
                    equipment.getEquipmentId(), request.getStartTime().toLocalDate()).stream()
                    .filter(a -> a.getRequestingInstitutionId().equals(institutionId))
                    .findFirst().get();

            com.labresource.backend.sharing.entity.SharedBooking sharedBooking = new com.labresource.backend.sharing.entity.SharedBooking();
            sharedBooking.setAgreementId(activeAgreement.getAgreementId());
            sharedBooking.setBookingId(saved.getBookingId());
            sharedBooking.setExternalInstitutionId(institutionId);
            sharedBooking.setUsageFee(java.math.BigDecimal.ZERO);

            BigDecimal extHourlyRate = equipment.getExternalHourlyRate();
            if (extHourlyRate != null) {
                sharedBooking.setEstimatedFee(extHourlyRate.multiply(BigDecimal.valueOf(hours)));
            } else {
                sharedBooking.setEstimatedFee(BigDecimal.ZERO);
            }
            sharedBooking.setPaymentStatus("PENDING");
            sharedBookingRepository.save(sharedBooking);
        }

        notificationService.notifyDepartmentLabManagers(
                equipment.getDepartmentId(),
                "BOOKING_REQUEST",
                "New Booking Request",
                "A new booking request for \"" + equipment.getName() + "\" is awaiting your approval.");

        return BookingDto.fromEntity(saved, equipment.getName());
    }

    public List<BookingDto> myBookings(Long userId, String tab) {
        List<String> statuses = switch (tab == null ? "upcoming" : tab.toLowerCase()) {
            case "active" -> ACTIVE_STATUSES;
            case "history" -> HISTORY_STATUSES;
            default -> UPCOMING_STATUSES;
        };

        List<Booking> bookings = "history".equalsIgnoreCase(tab)
                ? bookingRepository.findByUserIdAndStatusInOrderByStartTimeDesc(userId, statuses)
                : bookingRepository.findByUserIdAndStatusInOrderByStartTimeAsc(userId, statuses);

        List<Long> equipmentIds = bookings.stream()
                .map(Booking::getEquipmentId)
                .distinct()
                .toList();

        List<Equipment> equipments = equipmentService.getEntities(equipmentIds);
        Map<Long, String> equipmentNameMap = equipments.stream()
                .collect(Collectors.toMap(Equipment::getEquipmentId, Equipment::getName, (a, b) -> a));

        List<Long> approverAndRejectorIds = bookings.stream()
                .flatMap(b -> java.util.stream.Stream.of(b.getApprovedBy(), b.getRejectedBy()))
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> userNamesMap = approverAndRejectorIds.isEmpty()
                ? Map.of()
                : appUserRepository.findAllById(approverAndRejectorIds).stream()
                .collect(Collectors.toMap(
                        AppUser::getUserId,
                        u -> (u.getFirstName() + (u.getLastName() != null ? " " + u.getLastName() : "")).trim(),
                        (a, b) -> a
                ));

        return bookings.stream()
                .map(b -> BookingDto.fromEntity(
                        b,
                        equipmentNameMap.getOrDefault(b.getEquipmentId(), "Unknown Equipment"),
                        b.getApprovedBy() != null ? userNamesMap.get(b.getApprovedBy()) : null,
                        b.getRejectedBy() != null ? userNamesMap.get(b.getRejectedBy()) : null
                ))
                .toList();
    }

    @Transactional
    public BookingDto cancelBooking(Long userId, Long bookingId) {
        Booking booking = getOwnedBooking(userId, bookingId);
        if (!UPCOMING_STATUSES.contains(booking.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Only upcoming bookings can be cancelled.");
        }
        booking.setStatus(Booking.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Promote next user on waitlist
        waitlistService.promoteNext(saved.getEquipmentId(), saved.getStartTime(), saved.getEndTime());

        return BookingDto.fromEntity(saved, equipmentService.getEntity(saved.getEquipmentId()).getName());
    }

    @Transactional
    public BookingDto rescheduleBooking(Long userId, Long bookingId, RescheduleRequestDto request) {
        Booking booking = getOwnedBooking(userId, bookingId);
        if (!UPCOMING_STATUSES.contains(booking.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Only upcoming bookings can be rescheduled.");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }

        List<Booking> overlaps = bookingRepository.findOverlapping(
                booking.getEquipmentId(), request.getStartTime(), request.getEndTime(), booking.getBookingId());
        if (!overlaps.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "This time slot conflicts with an existing booking.");
        }

        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus(Booking.PENDING_APPROVAL);
        Booking saved = bookingRepository.save(booking);
        return BookingDto.fromEntity(saved, equipmentService.getEntity(saved.getEquipmentId()).getName());
    }

    @Transactional
    public BookingApprovalDto approveBooking(Long approverUserId, Long approverDeptId, Long approverInstId, boolean isSystemAdmin, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking request not found."));

        if (!Booking.PENDING_APPROVAL.equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking request #" + bookingId + " is no longer pending approval (current status: " + booking.getStatus() + ").");
        }

        Equipment equipment = equipmentService.getEntity(booking.getEquipmentId());

        // Validate institution & department ownership for manager/department head
        if (!isSystemAdmin) {
            if (approverInstId != null && !equipment.getInstitutionId().equals(approverInstId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to approve bookings for this institution.");
            }
            if (approverDeptId != null && !equipment.getDepartmentId().equals(approverDeptId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to approve bookings for this department.");
            }
        }

        booking.setStatus(Booking.CONFIRMED);
        booking.setApprovedBy(approverUserId);
        Booking saved = bookingRepository.save(booking);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String timeWindow = booking.getStartTime().format(dtf) + " to " + booking.getEndTime().format(dtf);
        notificationService.notifyUser(
                booking.getUserId(),
                "BOOKING_APPROVED",
                "Booking Request Approved",
                "Your booking request for \"" + equipment.getName() + "\" from " + timeWindow + " has been approved."
        );

        return toApprovalDto(saved);
    }

    @Transactional
    public BookingApprovalDto rejectBooking(Long approverUserId, Long approverDeptId, Long approverInstId, boolean isSystemAdmin, Long bookingId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejection reason is required.");
        }
        String cleanReason = reason.trim();
        if (cleanReason.length() > 1000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejection reason cannot exceed 1000 characters.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking request not found."));

        if (!Booking.PENDING_APPROVAL.equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking request #" + bookingId + " is no longer pending approval (current status: " + booking.getStatus() + ").");
        }

        Equipment equipment = equipmentService.getEntity(booking.getEquipmentId());

        // Validate institution & department ownership
        if (!isSystemAdmin) {
            if (approverInstId != null && !equipment.getInstitutionId().equals(approverInstId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to reject bookings for this institution.");
            }
            if (approverDeptId != null && !equipment.getDepartmentId().equals(approverDeptId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to reject bookings for this department.");
            }
        }

        booking.setStatus(Booking.REJECTED);
        booking.setRejectionReason(cleanReason);
        booking.setRejectedBy(approverUserId);
        booking.setRejectedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyUser(
                booking.getUserId(),
                "BOOKING_REJECTED",
                "Booking Request Rejected",
                "Your booking request for \"" + equipment.getName() + "\" has been rejected.\nReason: " + cleanReason
        );

        return toApprovalDto(saved);
    }

    public BookingDto getBookingDetails(Long userId, Long bookingId) {
        Booking booking = getOwnedBooking(userId, bookingId);
        Equipment equipment = equipmentService.getEntity(booking.getEquipmentId());
        return BookingDto.fromEntity(booking, equipment.getName());
    }

    public BookingApprovalDto getApprovalDetails(Long approverUserId, Long approverDeptId, Long approverInstId, boolean isSystemAdmin, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking request not found."));

        Equipment equipment = equipmentService.getEntity(booking.getEquipmentId());
        if (!isSystemAdmin) {
            if (approverInstId != null && !equipment.getInstitutionId().equals(approverInstId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to view booking details for this institution.");
            }
            if (approverDeptId != null && !equipment.getDepartmentId().equals(approverDeptId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to view booking details for this department.");
            }
        }

        return toApprovalDto(booking);
    }

    public List<BookingApprovalDto> getDepartmentBookings(Long approverUserId, Long departmentId, Long institutionId, boolean isSystemAdmin, String statusFilter) {
        List<Booking> bookings;
        if (isSystemAdmin && departmentId == null) {
            bookings = (institutionId != null)
                    ? bookingRepository.findByInstitutionId(institutionId)
                    : bookingRepository.findAll();
        } else {
            if (departmentId == null) {
                return List.of();
            }
            bookings = bookingRepository.findByDepartmentId(departmentId);
        }

        if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
            bookings = bookings.stream()
                    .filter(b -> statusFilter.equalsIgnoreCase(b.getStatus()))
                    .toList();
        }

        return bookings.stream()
                .map(this::toApprovalDto)
                .toList();
    }

    public BookingApprovalDto toApprovalDto(Booking b) {
        Equipment equipment = equipmentService.getEntity(b.getEquipmentId());
        AppUser applicant = appUserRepository.findById(b.getUserId()).orElse(null);
        Department dept = (equipment != null && equipment.getDepartmentId() != null)
                ? departmentRepository.findById(equipment.getDepartmentId()).orElse(null) : null;
        Institution inst = (equipment != null && equipment.getInstitutionId() != null)
                ? institutionRepository.findById(equipment.getInstitutionId()).orElse(null) : null;
        Laboratory lab = (equipment != null && equipment.getLabId() != null)
                ? laboratoryRepository.findById(equipment.getLabId()).orElse(null) : null;

        AppUser approver = b.getApprovedBy() != null ? appUserRepository.findById(b.getApprovedBy()).orElse(null) : null;
        AppUser rejector = b.getRejectedBy() != null ? appUserRepository.findById(b.getRejectedBy()).orElse(null) : null;

        String approverName = approver != null
                ? (approver.getFirstName() + (approver.getLastName() != null ? " " + approver.getLastName() : "")).trim()
                : null;
        String rejectorName = rejector != null
                ? (rejector.getFirstName() + (rejector.getLastName() != null ? " " + rejector.getLastName() : "")).trim()
                : null;

        double hours = (b.getStartTime() != null && b.getEndTime() != null)
                ? java.time.Duration.between(b.getStartTime(), b.getEndTime()).toMinutes() / 60.0
                : 0.0;

        String applicantName = applicant != null
                ? (applicant.getFirstName() + (applicant.getLastName() != null ? " " + applicant.getLastName() : "")).trim()
                : "Unknown Researcher";

        String applicantRole = (applicant != null && applicant.getRoles() != null && !applicant.getRoles().isEmpty())
                ? applicant.getRoles().iterator().next().getRoleName()
                : "RESEARCHER";

        Department userDept = (applicant != null && applicant.getDepartmentId() != null)
                ? departmentRepository.findById(applicant.getDepartmentId()).orElse(null) : null;
        Institution userInst = (applicant != null && applicant.getInstitutionId() != null)
                ? institutionRepository.findById(applicant.getInstitutionId()).orElse(null) : null;

        BookingApprovalDto.ApplicantDetails applicantDetails = BookingApprovalDto.ApplicantDetails.builder()
                .userId(b.getUserId())
                .fullName(applicantName)
                .email(applicant != null ? applicant.getEmail() : null)
                .phoneNumber(applicant != null ? applicant.getPhoneNumber() : null)
                .role(applicantRole)
                .rollNumber(applicant != null ? applicant.getRollNumber() : null)
                .researcherId(applicant != null ? applicant.getResearcherId() : null)
                .institutionName(userInst != null ? userInst.getName() : (inst != null ? inst.getName() : null))
                .institutionCode(userInst != null ? userInst.getCode() : (inst != null ? inst.getCode() : null))
                .departmentName(userDept != null ? userDept.getName() : (dept != null ? dept.getName() : null))
                .departmentCode(userDept != null ? userDept.getCode() : (dept != null ? dept.getCode() : null))
                .build();

        String calStatus = "NOT_RECORDED";
        if (equipment != null) {
            calStatus = equipmentService.hasValidCalibration(equipment.getEquipmentId()) ? "VALID" : "EXPIRED/NONE";
        }

        BookingApprovalDto.EquipmentDetails equipmentDetails = BookingApprovalDto.EquipmentDetails.builder()
                .equipmentId(equipment != null ? equipment.getEquipmentId() : b.getEquipmentId())
                .name(equipment != null ? equipment.getName() : "Unknown Equipment")
                .assetId(equipment != null ? (equipment.getSerialNumber() != null ? equipment.getSerialNumber() : "#" + equipment.getEquipmentId()) : null)
                .category(equipment != null ? equipment.getCategory() : null)
                .laboratory(lab != null ? lab.getName() : (equipment != null ? equipment.getLocation() : null))
                .location(equipment != null ? equipment.getLocation() : null)
                .condition(equipment != null ? (equipment.getCondition() != null ? equipment.getCondition() : "GOOD") : null)
                .calibrationStatus(calStatus)
                .capacityPerSlot(equipment != null ? equipment.getCapacityPerSlot() : 1)
                .hourlyRate(equipment != null ? equipment.getHourlyRate() : BigDecimal.ZERO)
                .build();

        BookingApprovalDto.BookingDetails bookingDetails = BookingApprovalDto.BookingDetails.builder()
                .bookingId(b.getBookingId())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .durationHours(hours)
                .purpose(b.getPurpose())
                .isRecurring(b.getIsRecurring())
                .recurrencePattern(b.getRecurrencePattern())
                .estimatedCost(b.getEstimatedCost())
                .paymentStatus(b.getPaymentStatus())
                .createdAt(b.getCreatedAt())
                .build();

        BookingApprovalDto.AgreementDetails agreementDetails = BookingApprovalDto.AgreementDetails.builder()
                .accepted(Boolean.TRUE.equals(b.getAgreementAccepted()))
                .version(b.getAgreementVersion())
                .acceptedAt(b.getAgreementAcceptedAt())
                .build();

        BookingApprovalDto.DecisionDetails decisionDetails = BookingApprovalDto.DecisionDetails.builder()
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .rejectedById(b.getRejectedBy())
                .rejectedByName(rejectorName)
                .rejectedAt(b.getRejectedAt())
                .approvedById(b.getApprovedBy())
                .approvedByName(approverName)
                .build();

        return BookingApprovalDto.builder()
                .bookingId(b.getBookingId())
                .status(b.getStatus())
                .applicant(applicantDetails)
                .equipment(equipmentDetails)
                .booking(bookingDetails)
                .agreement(agreementDetails)
                .decision(decisionDetails)
                .build();
    }

    public byte[] downloadBookingReceipt(Long userId, Long bookingId,
                                         com.labresource.backend.common.service.ReceiptPdfGeneratorService pdfGenerator,
                                         com.labresource.backend.auth.repository.AppUserRepository appUserRepository,
                                         com.labresource.backend.department.repository.DepartmentRepository departmentRepository,
                                         com.labresource.backend.institution.repository.InstitutionRepository institutionRepository) {
        Booking booking = getOwnedBooking(userId, bookingId);
        Equipment equipment = equipmentService.getEntity(booking.getEquipmentId());
        AppUser user = appUserRepository.findById(userId).orElse(null);
        Department department = equipment != null ? departmentRepository.findById(equipment.getDepartmentId()).orElse(null) : null;
        Institution institution = equipment != null ? institutionRepository.findById(equipment.getInstitutionId()).orElse(null) : null;

        return pdfGenerator.generateBookingReceiptPdf(booking, equipment, user, department, institution);
    }

    private Booking getOwnedBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found."));
        if (!booking.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This booking does not belong to you.");
        }
        return booking;
    }
}
