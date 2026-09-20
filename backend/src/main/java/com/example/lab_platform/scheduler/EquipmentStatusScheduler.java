package com.example.lab_platform.scheduler;

import com.example.lab_platform.entity.*;
import com.example.lab_platform.repository.*;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.service.NotificationService;
import com.example.lab_platform.service.CostManagementService;
import com.example.lab_platform.service.RealtimeUpdateService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class EquipmentStatusScheduler {

private final BookingRepository bookingRepository;
private final EquipmentRepository equipmentRepository;
private final MaintenanceRepository maintenanceRepository;
private final BookingService bookingService;
private final CalibrationRepository calibrationRepository;
private final CertificationRepository certificationRepository; // NEW
private final NotificationService notificationService;
private final UserRepository userRepository;
private final CostManagementService costManagementService;
private final WaitlistRepository waitlistRepository;
private final RealtimeUpdateService realtimeUpdateService;

public EquipmentStatusScheduler(
        BookingRepository bookingRepository,
        EquipmentRepository equipmentRepository,
        MaintenanceRepository maintenanceRepository,
        BookingService bookingService,
        CalibrationRepository calibrationRepository,
        CertificationRepository certificationRepository, // NEW
        NotificationService notificationService,
        CostManagementService costManagementService,
        UserRepository userRepository,
        WaitlistRepository waitlistRepository,
        RealtimeUpdateService realtimeUpdateService) {

    this.bookingRepository = bookingRepository;
    this.equipmentRepository = equipmentRepository;
    this.maintenanceRepository = maintenanceRepository;
    this.bookingService = bookingService;
    this.calibrationRepository = calibrationRepository;
    this.certificationRepository = certificationRepository; // NEW
    this.notificationService = notificationService;
    this.userRepository = userRepository;
    this.costManagementService = costManagementService;
    this.waitlistRepository = waitlistRepository;
    this.realtimeUpdateService = realtimeUpdateService;
        }

    /*
     * Run immediately after application startup,
     * then every 60 seconds.
     */
    @Scheduled(
            initialDelay = 1000,
            fixedRate = 60000
    )
    public void updateEquipmentStatus() {
        LocalDateTime now = LocalDateTime.now();

        // Each step is isolated: if one fails, the others (especially
        // auto-completing finished bookings) still run on this pass and
        // on the next one, instead of the whole sweep dying every minute.
        runSafely("activateDueMaintenance", this::activateDueMaintenance);
        runSafely("activateInUseBookings", this::activateInUseBookings);
        runSafely("expireUndecidedWaitlistEntries", this::expireUndecidedWaitlistEntries);

        // Bookings whose end time has passed (In Use / Confirmed) are
        // marked Completed automatically - nobody has to click Complete.
        runSafely("autoCompleteOverdueBookings", bookingService::autoCompleteOverdueBookings);

        // Task 3: as soon as a booking is auto-completed above, turn
        // it into a billable usage-cost record (and department cost
        // allocation) so Cost Management stays in sync automatically.
        runSafely("generateMissingCostRecords", costManagementService::generateMissingCostRecords);

        List<Equipment> equipmentList =
                equipmentRepository.findAll();

        boolean anyChanged = false;

        for (Equipment equipment : equipmentList) {
            String newStatus = calculateStatus(equipment, now);

            if (!newStatus.equalsIgnoreCase(equipment.getStatus())) {
                equipment.setStatus(newStatus);
                equipmentRepository.save(equipment);
                anyChanged = true;
            }
        }

        // Real-time push: tell connected clients equipment status
        // changed so they refetch instead of waiting on their own
        // poll interval (or never refreshing at all).
        if (anyChanged) {
            realtimeUpdateService.pingEquipmentUpdated();
        }
    }

    private void runSafely(String stepName, Runnable step) {
        try {
            step.run();
        } catch (Exception ex) {
            System.err.println("EquipmentStatusScheduler step '" + stepName + "' failed: " + ex.getMessage());
        }
    }

    private void activateDueMaintenance() {
        LocalDate today = LocalDate.now();
        List<Maintenance> scheduledMaintenance = maintenanceRepository.findByMaintenanceStatus("Scheduled");

        for (Maintenance maintenance : scheduledMaintenance) {
            LocalDate maintenanceDate = maintenance.getMaintenanceDate();
            if (maintenanceDate == null) continue;

            if (!maintenanceDate.isAfter(today)) {
                maintenance.setMaintenanceStatus("Active");
                maintenanceRepository.save(maintenance);
            }
        }
    }

    // NEW: the Booking's OWN bookingStatus was never actually being set
    // to "In Use" anywhere — only Equipment.status was, which left the
    // booking sitting at "Confirmed" for its entire active window and
    // meant nothing could ever distinguish "confirmed, not started yet"
    // from "happening right now" on the booking record itself (the docs
    // call for "In Use" as a real booking state, and features like the
    // mid-use "Report Issue" action on a booking depend on this exact
    // transition actually happening). Runs every 60s alongside the
    // equipment-status sweep; findByBookingStatusIn(["Confirmed"]) below
    // deliberately doesn't touch a booking that's already "In Use".
    private void activateInUseBookings() {
        LocalDateTime now = LocalDateTime.now();

        List<Booking> confirmed =
                bookingRepository.findByBookingStatusIn(List.of("Confirmed"));

        for (Booking booking : confirmed) {
            if (booking.getStartTime() == null || booking.getEndTime() == null) continue;

            if (!now.isBefore(booking.getStartTime()) && now.isBefore(booking.getEndTime())) {
                booking.setBookingStatus("In Use");
                bookingRepository.save(booking);
            }
        }
    }

    // NEW: a waitlist entry moves to AWAITING_DECISION when its
    // requested window has already passed without being allocated (see
    // BookingServiceImpl.processWaitlistForEquipment) — the person is
    // notified and given two options (REBOOK / EXIT, see
    // WaitlistServiceImpl.decideOnMissedWindow). If they never decide,
    // this sweep auto-closes it as CANCELLED once their original
    // requestedEndTime — the deadline the notice itself quoted — has
    // passed, so nothing sits open indefinitely just because no one
    // clicked anything. Same terminal status as an explicit decision;
    // there's no separate "rejected" state for this flow.
    private void expireUndecidedWaitlistEntries() {
        LocalDateTime now = LocalDateTime.now();

        List<Waitlist> awaitingDecision =
                waitlistRepository.findByWaitlistStatus("AWAITING_DECISION");

        for (Waitlist entry : awaitingDecision) {
            if (entry.getRequestedEndTime() == null
                    || entry.getRequestedEndTime().isAfter(now)) {
                continue;
            }

            entry.setWaitlistStatus("CANCELLED");
            waitlistRepository.save(entry);

            notificationService.create(
                    entry.getUser(),
                    "WAITLIST_AUTO_CANCELLED",
                    "Waitlist entry closed",
                    "You didn't respond in time, so your waitlist entry for "
                            + (entry.getEquipment() != null ? entry.getEquipment().getEquipmentName() : "the equipment")
                            + " has been closed. You can join the waitlist again or book a new slot anytime.",
                    entry.getWaitlistId()
            );
        }
    }

    private String calculateStatus(Equipment equipment, LocalDateTime now) {
        String existingStatus = equipment.getStatus();

        if (existingStatus != null
                && (existingStatus.equalsIgnoreCase("Out of Service")
                || existingStatus.equalsIgnoreCase("Retired"))) {
            return existingStatus;
        }

        Integer equipmentId = equipment.getEquipmentId();

        List<Maintenance> maintenanceList = maintenanceRepository.findByEquipment_EquipmentId(equipmentId);

        for (Maintenance maintenance : maintenanceList) {
            String maintenanceStatus = maintenance.getMaintenanceStatus();
            if (maintenanceStatus == null) continue;

            // "Pending Verification" and "Rejected" are open work too —
            // the technician is done or has been sent back, but no Lab
            // Manager has signed the work off yet, so the equipment must
            // not drift back to Available on a scheduler pass.
            if (maintenanceStatus.equalsIgnoreCase("Active")
                    || maintenanceStatus.equalsIgnoreCase("In Progress")
                    || maintenanceStatus.equalsIgnoreCase("Pending Verification")
                    || maintenanceStatus.equalsIgnoreCase("Rejected")) {
                return "Under Maintenance";
            }
        }

        List<Booking> bookings = bookingRepository.findByEquipment_EquipmentId(equipmentId);
        boolean futureBooking = false;

        for (Booking booking : bookings) {
            if (booking.getStartTime() == null || booking.getEndTime() == null) continue;

            String bookingStatus = booking.getBookingStatus();
            if (bookingStatus == null
                    || (!bookingStatus.equalsIgnoreCase("Confirmed")
                        && !bookingStatus.equalsIgnoreCase("In Use"))) continue;

            LocalDateTime start = booking.getStartTime();
            LocalDateTime end = booking.getEndTime();

            if (!now.isBefore(start) && now.isBefore(end)) {
                return "In Use";
            }
            if (now.isBefore(start)) {
                futureBooking = true;
            }
        }

        if (futureBooking) return "Booked";
        return "Available";
    }

    // =====================================================================
    // NEW: daily reminder sweep (calibration due/overdue, certification
    // expiry, maintenance due, idle equipment). Runs once a day; the
    // dedup guard (createIfNotAlreadyNotifiedToday) means running it more
    // than once a day is also harmless if the app restarts.
    // Cron: 8:00 AM server time, every day.
    // =====================================================================
    @Scheduled(cron = "0 0 8 * * *")
    public void dailyReminderSweep() {
        sendCalibrationReminders();
        sendCertificationExpiryReminders();
        sendMaintenanceDueReminders();
        sendIdleEquipmentAlerts();
    }

    private List<User> techsAndManagersFor(Equipment equipment) {
        // EDGE CASE: equipment with no institution set (shouldn't happen,
        // but don't NPE if it does) — nobody to notify, return empty.
        if (equipment.getInstitution() == null) return List.of();

        return userRepository.findByInstitution_InstitutionId(equipment.getInstitution().getInstitutionId())
                .stream()
                .filter(u -> u.getRole() != null
                        && ("LAB_TECHNICIAN".equalsIgnoreCase(u.getRole().getRoleName())
                            || "LAB_MANAGER".equalsIgnoreCase(u.getRole().getRoleName())))
                .toList();
    }

    private void sendCalibrationReminders() {
        LocalDate today = LocalDate.now();

        List<EquipmentCalibration> dueSoon =
                calibrationRepository.findByNextCalibrationDateBetween(today, today.plusDays(7));
        List<EquipmentCalibration> overdue =
                calibrationRepository.findByNextCalibrationDateLessThanEqual(today);

        for (EquipmentCalibration c : dueSoon) {
            notifyForCalibration(c, "CALIBRATION_DUE_SOON",
                    "Calibration due soon",
                    c.getEquipment().getEquipmentName() + " is due for calibration on " + c.getNextCalibrationDate() + ".");
        }
        for (EquipmentCalibration c : overdue) {
            notifyForCalibration(c, "CALIBRATION_OVERDUE",
                    "Calibration overdue",
                    c.getEquipment().getEquipmentName() + " calibration was due " + c.getNextCalibrationDate() + " and is now overdue.");
        }
    }

    private void sendCertificationExpiryReminders() {
    LocalDate today = LocalDate.now();

    // Uses the REAL certification module (EquipmentCertification),
    // not EquipmentCalibration — see the Task 2 audit fix.
    List<EquipmentCertification> expiringSoon =
            certificationRepository.findByExpiryDateBetween(today, today.plusDays(30));
    List<EquipmentCertification> expired =
            certificationRepository.findByExpiryDateLessThanEqual(today);

    for (EquipmentCertification c : expiringSoon) {
        notifyForCertification(c, "CERTIFICATION_EXPIRING",
                "Certification expiring soon",
                c.getEquipment().getEquipmentName() + "'s " + c.getCertificationName()
                        + " certificate expires " + c.getExpiryDate() + ".");
    }
    for (EquipmentCertification c : expired) {
        notifyForCertification(c, "CERTIFICATION_EXPIRED",
                "Certification expired",
                c.getEquipment().getEquipmentName() + "'s " + c.getCertificationName()
                        + " certificate expired " + c.getExpiryDate() + ".");
    }
}

private void notifyForCertification(EquipmentCertification c, String type, String title, String message) {
    // EDGE CASE: certification record with equipment somehow null — skip safely
    if (c.getEquipment() == null) return;

    for (User u : techsAndManagersFor(c.getEquipment())) {
        notificationService.createIfNotAlreadyNotifiedToday(
                u, type, title, message, c.getCertificationId()
        );
    }
}

    private void notifyForCalibration(EquipmentCalibration c, String type, String title, String message) {
        // EDGE CASE: calibration record with equipment somehow null — skip safely
        if (c.getEquipment() == null) return;

        for (User u : techsAndManagersFor(c.getEquipment())) {
            notificationService.createIfNotAlreadyNotifiedToday(
                    u, type, title, message, c.getCalibrationId()
            );
        }
    }

    private void sendMaintenanceDueReminders() {
        LocalDate today = LocalDate.now();

        List<Maintenance> scheduled = maintenanceRepository.findByMaintenanceStatus("Scheduled");

        for (Maintenance m : scheduled) {
            // EDGE CASE: no date set on the record — nothing to compare, skip
            if (m.getMaintenanceDate() == null) continue;
            // Only alert once it's within 3 days or already overdue —
            // matches the calibration due-soon window pattern.
            if (m.getMaintenanceDate().isAfter(today.plusDays(3))) continue;

            boolean overdue = m.getMaintenanceDate().isBefore(today);
            String title = overdue ? "Maintenance overdue" : "Maintenance due soon";
            String type = overdue ? "MAINTENANCE_OVERDUE" : "MAINTENANCE_DUE_SOON";
            String equipName = m.getEquipment() != null ? m.getEquipment().getEquipmentName() : "Equipment";

            // EDGE CASE: unassigned maintenance record — fall back to
            // notifying the equipment's techs/managers instead of no one.
            if (m.getAssignedTechnician() != null) {
                notificationService.createIfNotAlreadyNotifiedToday(
                        m.getAssignedTechnician(), type, title,
                        equipName + " maintenance is " + (overdue ? "overdue (was due " : "due ")
                                + m.getMaintenanceDate() + (overdue ? ")." : "."),
                        m.getMaintenanceId()
                );
            } else if (m.getEquipment() != null) {
                for (User u : techsAndManagersFor(m.getEquipment())) {
                    notificationService.createIfNotAlreadyNotifiedToday(
                            u, type, title,
                            equipName + " maintenance is unassigned and " + (overdue ? "overdue." : "due soon."),
                            m.getMaintenanceId()
                    );
                }
            }
        }
    }

    private void sendIdleEquipmentAlerts() {
        LocalDate today = LocalDate.now();
        List<Equipment> allEquipment = equipmentRepository.findAll();

        for (Equipment e : allEquipment) {
            // EDGE CASE: skip equipment that's out of service/retired/in
            // maintenance/in calibration — idleness there is expected,
            // not a problem worth alerting on.
            String status = e.getStatus();
            if (status != null && !status.equalsIgnoreCase("Available")) continue;

            LocalDate lastUsed = e.getLastUsedDate();
            long idleDays = (lastUsed == null)
                    ? Long.MAX_VALUE  // EDGE CASE: never used at all
                    : java.time.temporal.ChronoUnit.DAYS.between(lastUsed, today);

            if (idleDays < 14) continue; // threshold: 14+ idle days triggers an alert

            for (User u : techsAndManagersFor(e)) {
                if (!"LAB_MANAGER".equalsIgnoreCase(u.getRole().getRoleName())) continue; // managers only, per spec

                notificationService.createIfNotAlreadyNotifiedToday(
                        u, "IDLE_EQUIPMENT",
                        "Idle equipment alert",
                        e.getEquipmentName() + " has been idle for "
                                + (idleDays == Long.MAX_VALUE ? "a long time (never used)" : idleDays + " days") + ".",
                        e.getEquipmentId()
                );
            }
        }
    }

    // =====================================================================
    // NEW: booking-start reminders. Needs finer granularity than the
    // daily sweep, so it runs every 15 minutes; the dedup guard still
    // prevents repeat notifications within the same day.
    // =====================================================================
    @Scheduled(initialDelay = 20000, fixedRate = 900000)
    public void sendBookingReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusHours(1);

        List<Booking> confirmed = bookingRepository.findByBookingStatus("Confirmed");

        for (Booking b : confirmed) {
            // EDGE CASE: malformed booking with no start time — skip
            if (b.getStartTime() == null) continue;

            // Only bookings starting within the next hour, that haven't started yet
            if (b.getStartTime().isBefore(now) || b.getStartTime().isAfter(windowEnd)) continue;

            String equipName = b.getEquipment() != null ? b.getEquipment().getEquipmentName() : "your equipment";

            notificationService.createIfNotAlreadyNotifiedToday(
                    b.getUser(), "BOOKING_REMINDER", "Upcoming booking reminder",
                    "Your booking for " + equipName + " starts at " + b.getStartTime() + ".",
                    b.getBookingId()
            );
        }
    }
}