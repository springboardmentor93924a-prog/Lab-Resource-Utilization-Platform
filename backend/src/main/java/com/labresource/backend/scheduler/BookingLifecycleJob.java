package com.labresource.backend.scheduler;

import com.labresource.backend.billing.service.BillingService;
import com.labresource.backend.billing.service.InvoiceService;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.budget.util.FiscalYearUtil;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.sharing.entity.SharedBooking;
import com.labresource.backend.sharing.entity.SharingAgreement;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.repository.SharingAgreementRepository;
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
    private final SharingAgreementRepository sharingAgreementRepository;
    private final BillingService billingService;
    private final InvoiceService invoiceService;

    private final com.labresource.backend.billing.repository.CostRecordRepository costRecordRepository;

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
                    booking.setPaymentStatus("PAID");

                    // Record cost against researcher's department budget
                    billingService.recordCostWithDetails(
                            booking.getBookingId(),
                            null,
                            null,
                            equipment.getEquipmentId(),
                            equipment.getDepartmentId(),
                            equipment.getInstitutionId(),
                            actualCost,
                            "USAGE"
                    );
                }

                // For inter-institution shared bookings: compute final usageFee & generate invoice
                Optional<SharedBooking> sharedOpt = sharedBookingRepository.findByBookingId(booking.getBookingId());
                if (sharedOpt.isPresent()) {
                    SharedBooking sharedBooking = sharedOpt.get();
                    Optional<SharingAgreement> agreementOpt = sharingAgreementRepository.findById(sharedBooking.getAgreementId());
                    Long requestingInstId = agreementOpt.map(SharingAgreement::getRequestingInstitutionId).orElse(null);
                    BigDecimal rateToUse = (agreementOpt.isPresent() && agreementOpt.get().getHourlyRate() != null && agreementOpt.get().getHourlyRate().compareTo(BigDecimal.ZERO) > 0)
                            ? agreementOpt.get().getHourlyRate()
                            : equipment.getExternalHourlyRate();

                    if (rateToUse != null && rateToUse.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal usageFee = rateToUse.multiply(actualHours).setScale(2, RoundingMode.HALF_UP);
                        sharedBooking.setUsageFee(usageFee);
                        sharedBooking.setPaymentStatus("INVOICED");
                        sharedBookingRepository.save(sharedBooking);

                        boolean isNewCost = costRecordRepository.findByBookingIdAndCostType(booking.getBookingId(), "SHARING_FEE").isEmpty();

                        // Record sharing cost entry for transaction ledger
                        billingService.recordCostWithDetails(
                                booking.getBookingId(),
                                null,
                                sharedBooking.getAgreementId(),
                                equipment.getEquipmentId(),
                                equipment.getDepartmentId(),
                                equipment.getInstitutionId(),
                                usageFee,
                                "SHARING_FEE"
                        );

                        // Generate/Update Invoice for inter-institution billing (idempotent & consolidated)
                        if (requestingInstId != null && usageFee.compareTo(BigDecimal.ZERO) > 0) {
                            invoiceService.createSharingInvoice(
                                    sharedBooking.getAgreementId(),
                                    equipment.getInstitutionId(),
                                    requestingInstId,
                                    equipment.getDepartmentId(),
                                    usageFee,
                                    FiscalYearUtil.getCurrentFiscalYear(),
                                    isNewCost
                            );
                        }
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
