package com.labresource.backend.scheduler;

import com.labresource.backend.billing.service.BillingService;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.sharing.entity.SharedBooking;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.utilization.entity.UtilizationLog;
import com.labresource.backend.utilization.repository.UtilizationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingLifecycleJob {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UtilizationLogRepository utilizationLogRepository;
    private final SharedBookingRepository sharedBookingRepository;
    private final BillingService billingService;

    @Scheduled(cron = "0 */5 * * * *") // Runs every 5 minutes
    @Transactional
    public void processBookingLifecycle() {
        log.info("Running BookingLifecycleJob...");
        LocalDateTime now = LocalDateTime.now();

        // 1. Transition CONFIRMED -> IN_USE
        List<Booking> startingBookings = bookingRepository.findAll().stream()
                .filter(b -> Booking.CONFIRMED.equals(b.getStatus()) && !b.getStartTime().isAfter(now))
                .toList();

        for (Booking booking : startingBookings) {
            log.info("Transitioning booking ID {} to IN_USE", booking.getBookingId());
            booking.setStatus(Booking.IN_USE);
            bookingRepository.save(booking);

            // Set Equipment status to BOOKED
            equipmentRepository.findById(booking.getEquipmentId()).ifPresent(eq -> {
                eq.setStatus(Equipment.BOOKED);
                equipmentRepository.save(eq);
            });

            // Create UtilizationLog entry
            if (utilizationLogRepository.findByBookingId(booking.getBookingId()).isEmpty()) {
                UtilizationLog logEntry = new UtilizationLog();
                logEntry.setEquipmentId(booking.getEquipmentId());
                logEntry.setBookingId(booking.getBookingId());
                logEntry.setUsageStartTime(booking.getStartTime());
                logEntry.setSource("MANUAL");
                utilizationLogRepository.save(logEntry);
            }
        }

        // 2. Transition IN_USE -> COMPLETED
        List<Booking> endingBookings = bookingRepository.findAll().stream()
                .filter(b -> Booking.IN_USE.equals(b.getStatus()) && !b.getEndTime().isAfter(now))
                .toList();

        for (Booking booking : endingBookings) {
            log.info("Transitioning booking ID {} to COMPLETED", booking.getBookingId());
            booking.setStatus(Booking.COMPLETED);

            // Close UtilizationLog entry and compute actual duration
            Optional<UtilizationLog> logOpt = utilizationLogRepository.findByBookingId(booking.getBookingId());
            long actualMinutes = 0;
            if (logOpt.isPresent()) {
                UtilizationLog logEntry = logOpt.get();
                logEntry.setUsageEndTime(booking.getEndTime());
                long minutes = Duration.between(logEntry.getUsageStartTime(), booking.getEndTime()).toMinutes();
                logEntry.setDurationMinutes((int) minutes);
                utilizationLogRepository.save(logEntry);
                actualMinutes = minutes;
            }

            // Compute actualCost from actual duration
            Equipment equipment = equipmentRepository.findById(booking.getEquipmentId()).orElse(null);
            if (equipment != null) {
                BigDecimal actualHours = BigDecimal.valueOf(actualMinutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);

                if (equipment.getHourlyRate() != null && equipment.getHourlyRate().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal actualCost = equipment.getHourlyRate().multiply(actualHours).setScale(2, RoundingMode.HALF_UP);
                    booking.setActualCost(actualCost);
                    booking.setPaymentStatus("COMPLETED");

                    // Record cost against department budget
                    billingService.recordCost(
                            booking.getBookingId(),
                            equipment.getEquipmentId(),
                            equipment.getDepartmentId(),
                            equipment.getInstitutionId(),
                            actualCost,
                            "USAGE"
                    );
                }

                // For inter-institution shared bookings: compute final usageFee
                Optional<SharedBooking> sharedOpt = sharedBookingRepository.findByBookingId(booking.getBookingId());
                if (sharedOpt.isPresent()) {
                    SharedBooking sharedBooking = sharedOpt.get();
                    if (equipment.getExternalHourlyRate() != null && equipment.getExternalHourlyRate().compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal usageFee = equipment.getExternalHourlyRate().multiply(actualHours).setScale(2, RoundingMode.HALF_UP);
                        sharedBooking.setUsageFee(usageFee);
                        sharedBooking.setPaymentStatus("COMPLETED");
                        sharedBookingRepository.save(sharedBooking);

                        // Record sharing fee against cost record
                        billingService.recordCost(
                                booking.getBookingId(),
                                equipment.getEquipmentId(),
                                equipment.getDepartmentId(),
                                equipment.getInstitutionId(),
                                usageFee,
                                "SHARING_FEE"
                        );
                    }
                }

                // Restore Equipment status to AVAILABLE
                equipment.setStatus(Equipment.AVAILABLE);
                equipmentRepository.save(equipment);
            }

            bookingRepository.save(booking);
        }
    }
}
