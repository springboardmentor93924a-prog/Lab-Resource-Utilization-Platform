package com.labplatform.equipment.service;

import com.labplatform.booking.model.Booking;
import com.labplatform.booking.model.BookingStatus;
import com.labplatform.booking.repository.BookingRepository;
import com.labplatform.equipment.dto.CalibrationAlertResponse;
import com.labplatform.equipment.dto.EquipmentRequest;
import com.labplatform.equipment.dto.EquipmentResponse;
import com.labplatform.equipment.dto.EquipmentUtilizationResponse;
import com.labplatform.equipment.dto.UtilizationCostReportRow;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.model.EquipmentStatus;
import com.labplatform.equipment.repository.EquipmentRepository;
import com.labplatform.institution.model.Institution;
import com.labplatform.institution.repository.InstitutionRepository;
import com.labplatform.notification.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final InstitutionRepository institutionRepository;
    private final NotificationService notificationService;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            InstitutionRepository institutionRepository,
            NotificationService notificationService) {

        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.institutionRepository = institutionRepository;
        this.notificationService = notificationService;

    }@Scheduled(
            fixedDelay = 30000
    )
    public void scheduledCalibrationAndCertificationAlerts() {

        generateCalibrationAndCertificationNotifications();
    }

    public List<EquipmentResponse> getAllEquipment() {
        return equipmentRepository.findAll()
                .stream()
                .map(EquipmentResponse::new)
                .collect(Collectors.toList());
    }

    public EquipmentResponse getEquipmentById(Long id) {

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equipment not found with id: " + id));

        return new EquipmentResponse(equipment);
    }

    public EquipmentResponse addEquipment(EquipmentRequest request) {

        Equipment equipment = new Equipment();

        applyRequestToEquipment(equipment, request);

        Equipment saved = equipmentRepository.save(equipment);

        return new EquipmentResponse(saved);
    }

    public EquipmentResponse updateEquipment(
            Long id,
            EquipmentRequest request) {

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equipment not found with id: " + id));

        applyRequestToEquipment(equipment, request);

        Equipment updated = equipmentRepository.save(equipment);

        return new EquipmentResponse(updated);
    }

    /*
     * ============================================================
     * CALIBRATION ALERTS
     * ============================================================
     *
     * Shows equipment whose NEXT calibration is:
     *
     * 1. Already overdue
     * 2. Due within the next 30 days
     *
     * This is used by the calibration-alerts API.
     */
    public List<CalibrationAlertResponse> getCalibrationAlerts() {

        List<Equipment> allEquipment =
                equipmentRepository.findAll();

        LocalDate today = LocalDate.now();

        return allEquipment.stream()

                // Only equipment having a next calibration date
                .filter(e -> e.getNextCalibrationDate() != null)

                // Overdue OR due within 30 days
                .filter(e -> {

                    long daysUntilDue =
                            ChronoUnit.DAYS.between(
                                    today,
                                    e.getNextCalibrationDate());

                    return daysUntilDue <= 30;
                })

                .map(e -> {

                    long daysUntilDue =
                            ChronoUnit.DAYS.between(
                                    today,
                                    e.getNextCalibrationDate());

                    String urgency =
                            daysUntilDue < 0
                                    ? "OVERDUE"
                                    : "DUE_SOON";

                    return new CalibrationAlertResponse(
                            e.getId(),
                            e.getEquipmentName(),
                            e.getCategory(),
                            e.getNextCalibrationDate(),
                            (int) daysUntilDue,
                            urgency
                    );
                })

                .sorted(
                        (a, b) ->
                                a.getDaysUntilDue()
                                        .compareTo(b.getDaysUntilDue())
                )

                .collect(Collectors.toList());
    }

    public List<UtilizationCostReportRow> generateUtilizationCostReport(
            LocalDate from,
            LocalDate to) {

        List<Equipment> allEquipment =
                equipmentRepository.findAll();

        List<UtilizationCostReportRow> rows =
                new ArrayList<>();

        for (Equipment equipment : allEquipment) {

            List<Booking> bookingsInRange =
                    bookingRepository
                            .findByEquipmentId(equipment.getId())
                            .stream()

                            .filter(b ->
                                    !b.getBookingDate().isBefore(from)
                                            && !b.getBookingDate().isAfter(to))

                            .filter(b ->
                                    b.getBookingStatus()
                                            == BookingStatus.CONFIRMED
                                            ||
                                            b.getBookingStatus()
                                                    == BookingStatus.COMPLETED)

                            .collect(Collectors.toList());

            int totalBookings =
                    bookingsInRange.size();

            int usageHours =
                    bookingsInRange.stream()
                            .mapToInt(b ->
                                    b.getDurationHours() != null
                                            ? b.getDurationHours()
                                            : 0)
                            .sum();

            long daysInRange =
                    ChronoUnit.DAYS.between(from, to) + 1;

            double maxHours =
                    daysInRange * 8;

            double utilizationRate =
                    maxHours > 0
                            ? Math.min(
                            (usageHours / maxHours) * 100,
                            100.0)
                            : 0;

            utilizationRate =
                    Math.round(utilizationRate * 10.0) / 10.0;

            java.math.BigDecimal totalCost =
                    equipment.getHourlyRate() != null
                            ? equipment.getHourlyRate()
                            .multiply(
                                    java.math.BigDecimal
                                            .valueOf(usageHours))
                            : java.math.BigDecimal.ZERO;

            rows.add(
                    new UtilizationCostReportRow(
                            equipment.getId(),
                            equipment.getEquipmentName(),
                            equipment.getCategory(),
                            totalBookings,
                            usageHours,
                            utilizationRate,
                            totalCost
                    )
            );
        }

        return rows;
    }
    public void generateCalibrationAndCertificationNotifications() {

        List<Equipment> allEquipment =
                equipmentRepository.findAll();

        LocalDate today = LocalDate.now();

        for (Equipment equipment : allEquipment) {

            /*
             * ==========================================
             * CALIBRATION ALERTS
             * ==========================================
             */

            LocalDate nextCalibration =
                    equipment.getNextCalibrationDate();

            if (nextCalibration != null) {

                long daysUntilDue =
                        ChronoUnit.DAYS.between(
                                today,
                                nextCalibration
                        );

                // OVERDUE
                if (daysUntilDue < 0) {

                    String message =
                            "Calibration overdue for "
                                    + equipment.getEquipmentName()
                                    + ". It was due on "
                                    + nextCalibration
                                    + ".";

                    notificationService.createForManagementRoles(
                            "CALIBRATION_OVERDUE",
                            message
                    );
                }

                // DUE WITHIN 30 DAYS
                else if (daysUntilDue <= 30) {

                    String message =
                            "Calibration due soon for "
                                    + equipment.getEquipmentName()
                                    + ". Calibration is due on "
                                    + nextCalibration
                                    + ".";

                    notificationService.createForManagementRoles(
                            "CALIBRATION_DUE_SOON",
                            message
                    );
                }
            }

            /*
             * ==========================================
             * CERTIFICATION EXPIRY ALERT
             * ==========================================
             */

            LocalDate certificationExpiry =
                    equipment.getCertificationExpiryDate();

            if (certificationExpiry != null) {

                long daysUntilExpiry =
                        ChronoUnit.DAYS.between(
                                today,
                                certificationExpiry
                        );

                // CERTIFICATION ALREADY EXPIRED
                if (daysUntilExpiry < 0) {

                    String message =
                            "Certification expired for "
                                    + equipment.getEquipmentName()
                                    + ". It expired on "
                                    + certificationExpiry
                                    + ".";

                    notificationService.createForManagementRoles(
                            "CERTIFICATION_EXPIRED",
                            message
                    );
                }

                // CERTIFICATION EXPIRING WITHIN 30 DAYS
                else if (daysUntilExpiry <= 30) {

                    String message =
                            "Certification for "
                                    + equipment.getEquipmentName()
                                    + " is expiring on "
                                    + certificationExpiry
                                    + ".";

                    notificationService.createForManagementRoles(
                            "CERTIFICATION_EXPIRING",
                            message
                    );
                }
            }
        }
    }

    public void deleteEquipment(Long id) {

        if (!equipmentRepository.existsById(id)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Equipment not found with id: " + id);
        }

        boolean hasBookings =
                !bookingRepository
                        .findByEquipmentId(id)
                        .isEmpty();

        if (hasBookings) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete equipment: it has existing bookings referencing it");
        }

        equipmentRepository.deleteById(id);
    }

    public List<EquipmentUtilizationResponse> getUtilizationData() {

        List<Equipment> allEquipment =
                equipmentRepository.findAll();

        List<EquipmentUtilizationResponse> results =
                new ArrayList<>();

        List<Integer> allTotalBookings =
                new ArrayList<>();

        for (Equipment equipment : allEquipment) {

            List<Booking> bookings =
                    bookingRepository
                            .findByEquipmentId(equipment.getId());

            allTotalBookings.add(bookings.size());
        }

        List<Integer> sortedDescending =
                new ArrayList<>(allTotalBookings);

        sortedDescending.sort(
                Collections.reverseOrder());

        int top20PercentIndex =
                (int) Math.ceil(
                        sortedDescending.size() * 0.2) - 1;

        int demandThreshold =
                sortedDescending.isEmpty()
                        || top20PercentIndex < 0
                        ? Integer.MAX_VALUE
                        : sortedDescending.get(
                        Math.max(top20PercentIndex, 0));

        for (Equipment equipment : allEquipment) {

            List<Booking> bookings =
                    bookingRepository
                            .findByEquipmentId(equipment.getId());

            int totalBookings =
                    bookings.size();

            List<Booking> confirmedOrCompleted =
                    bookings.stream()
                            .filter(b ->
                                    b.getBookingStatus()
                                            == BookingStatus.CONFIRMED
                                            ||
                                            b.getBookingStatus()
                                                    == BookingStatus.COMPLETED)
                            .collect(Collectors.toList());

            int usageHours =
                    confirmedOrCompleted.stream()
                            .mapToInt(b ->
                                    b.getDurationHours() != null
                                            ? b.getDurationHours()
                                            : 0)
                            .sum();

            double maxAvailableHours =
                    30 * 8;

            double utilizationRate =
                    Math.min(
                            (usageHours / maxAvailableHours) * 100,
                            100.0);

            utilizationRate =
                    Math.round(utilizationRate * 10.0) / 10.0;

            boolean highDemand =
                    totalBookings >= demandThreshold
                            && totalBookings > 0;

            Integer daysIdle = null;

            boolean isIdle;

            if (!confirmedOrCompleted.isEmpty()) {

                LocalDate mostRecentDate =
                        confirmedOrCompleted.stream()
                                .map(Booking::getBookingDate)
                                .max(LocalDate::compareTo)
                                .orElse(null);

                if (mostRecentDate != null) {

                    daysIdle =
                            (int) ChronoUnit.DAYS.between(
                                    mostRecentDate,
                                    LocalDate.now());

                    isIdle =
                            daysIdle >= 14;

                } else {

                    isIdle = true;
                }

            } else {

                isIdle = true;
            }

            results.add(
                    new EquipmentUtilizationResponse(
                            equipment.getId(),
                            equipment.getEquipmentName(),
                            equipment.getCategory(),
                            equipment.getStatus() != null
                                    ? equipment.getStatus().name()
                                    : null,
                            totalBookings,
                            usageHours,
                            utilizationRate,
                            highDemand,
                            daysIdle,
                            isIdle
                    )
            );
        }

        return results;
    }

    /*
     * ============================================================
     * APPLY EQUIPMENT REQUEST
     * ============================================================
     *
     * Copies all equipment information from the frontend request
     * into the Equipment entity.
     */
    private void applyRequestToEquipment(
            Equipment equipment,
            EquipmentRequest request) {

        equipment.setEquipmentName(
                request.getEquipmentName());

        equipment.setAssetTag(
                request.getAssetTag());

        equipment.setCategory(
                request.getCategory());

        equipment.setDepartment(
                request.getDepartment());

        equipment.setManufacturer(
                request.getManufacturer());

        equipment.setModel(
                request.getModel());

        equipment.setImageUrl(
                request.getImageUrl());

        /*
         * Existing calibration field.
         */
        equipment.setCalibrationDueDate(
                request.getCalibrationDueDate());

        /*
         * NEW CALIBRATION INFORMATION
         */
        equipment.setLastCalibrationDate(
                request.getLastCalibrationDate());

        equipment.setNextCalibrationDate(
                request.getNextCalibrationDate());

        /*
         * NEW CERTIFICATION INFORMATION
         */
        equipment.setCertificationDetails(
                request.getCertificationDetails());

        equipment.setCertificationExpiryDate(
                request.getCertificationExpiryDate());

        /*
         * Existing documents.
         */
        equipment.setManualDocument(
                request.getManualDocument());

        equipment.setCalibrationCertificate(
                request.getCalibrationCertificate());

        /*
         * Hourly rate.
         */
        equipment.setHourlyRate(
                request.getHourlyRate());

        /*
         * Equipment status.
         */
        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {

            try {

                equipment.setStatus(
                        EquipmentStatus.valueOf(
                                request.getStatus().toUpperCase()));

            } catch (IllegalArgumentException ex) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid status value. Allowed values: AVAILABLE, IN_USE, MAINTENANCE");
            }

        } else if (equipment.getStatus() == null) {

            equipment.setStatus(
                    EquipmentStatus.AVAILABLE);
        }

        /*
         * Institution.
         */
        if (request.getInstitutionId() != null) {

            Institution institution =
                    institutionRepository
                            .findById(
                                    request.getInstitutionId())
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.BAD_REQUEST,
                                            "Invalid institution id: "
                                                    + request.getInstitutionId()));

            equipment.setInstitution(institution);

        } else if (equipment.getInstitution() == null) {

            Institution defaultInstitution =
                    institutionRepository
                            .findById(1)
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.INTERNAL_SERVER_ERROR,
                                            "Default institution not found"));

            equipment.setInstitution(
                    defaultInstitution);
        }
    }
}