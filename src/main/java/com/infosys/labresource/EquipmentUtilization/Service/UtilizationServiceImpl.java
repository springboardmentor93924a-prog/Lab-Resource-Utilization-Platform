package com.infosys.labresource.EquipmentUtilization.Service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationAnalyticsDTO;
import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationResponseDTO;
import com.infosys.labresource.EquipmentUtilization.Entity.Utilization;
import com.infosys.labresource.EquipmentUtilization.Entity.UtilizationStatus;
import com.infosys.labresource.EquipmentUtilization.Repository.EquipmentUtilizationRepository;
import com.infosys.labresource.booking.Repository.BookingRepository;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.booking.entity.BookingStatus;
import com.infosys.labresource.booking.entity.BookingWaitlist;
import com.infosys.labresource.booking.Repository.BookingWaitlistRepository;
import org.springframework.transaction.annotation.Transactional;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UtilizationServiceImpl implements UtilizationService{
    private final EquipmentUtilizationRepository utilRepo;
    private final BookingRepository bookingRepo;
    private final EquipmentRepository equipRepo;
    private final BookingWaitlistRepository waitlistRepo;

    @Override
    public UtilizationResponseDTO startUtilization(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed bookings can start utilization.");
        }

        Equipment equip = booking.getEquipment();

        if (equip.getStatus() != EquipmentStatus.BOOKED) {
            throw new RuntimeException("Equipment is not ready for utilization.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(booking.getStartTime())) {
            throw new RuntimeException("Equipment utilization cannot start before booking start time.");
        }

        Optional<Utilization> oldRecord = utilRepo.findByBooking(booking);

        if (oldRecord.isPresent()) {
            throw new RuntimeException("Equipment utilization already started.");
        }

        Utilization util = new Utilization();

        util.setBooking(booking);
        util.setEquipment(equip);
        util.setStartTime(LocalDateTime.now());
        util.setEndTime(booking.getEndTime());
        util.setStatus(UtilizationStatus.ACTIVE);
        util.setLastUpdated(LocalDateTime.now());

        equip.setStatus(EquipmentStatus.IN_USE);
        equipRepo.save(equip);

        Utilization savedUtil = utilRepo.save(util);

        return convertToDTO(savedUtil);
    }

    @Override
    @Transactional
    public UtilizationResponseDTO endUtilization(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        Utilization util = utilRepo.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Utilization record not found."));

        if (util.getStatus() == UtilizationStatus.COMPLETED) {
            throw new RuntimeException("Equipment utilization already completed.");
        }

        LocalDateTime endTime = LocalDateTime.now();

        util.setEndTime(endTime);

        long minutes = Duration.between(util.getStartTime(), endTime).toMinutes();
        double usageHours = minutes / 60.0;

        util.setUsageHours(usageHours);
        util.setStatus(UtilizationStatus.COMPLETED);
        util.setLastUpdated(LocalDateTime.now());

        Equipment equip = booking.getEquipment();
        equip.setStatus(EquipmentStatus.AVAILABLE);

        booking.setStatus(BookingStatus.COMPLETED);

        equipRepo.save(equip);
        bookingRepo.save(booking);

        Utilization updatedUtil = utilRepo.save(util);

        // equipment just got freed up, check if someone is waiting for it
        notifyNextInWaitlist(equip);

        return convertToDTO(updatedUtil);
    }

    @Override
    public List<UtilizationResponseDTO> getAllUtilization() {
        List<Utilization> utilList = utilRepo.findAll();

        List<UtilizationResponseDTO> responseList = new ArrayList<>();

        for (Utilization util : utilList) {
            responseList.add(convertToDTO(util));
        }

        return responseList;
    }

    @Override
    public UtilizationResponseDTO getUtilizationById(Long utilizationId) {
        Utilization util = utilRepo.findById(utilizationId)
                .orElseThrow(() -> new RuntimeException("Utilization record not found."));

        return convertToDTO(util);
    }

    private UtilizationResponseDTO convertToDTO(Utilization util) {
        UtilizationResponseDTO dto = new UtilizationResponseDTO();
        dto.setUtilizationId(util.getUtilizationId());
        dto.setBookingId(util.getBooking().getBookingId());
        dto.setEquipId(util.getEquipment().getEquipId());
        dto.setStartTime(util.getStartTime());
        dto.setEndTime(util.getEndTime());
        dto.setUsageHours(util.getUsageHours());
        dto.setStatus(util.getStatus());
        dto.setLastUpdated(util.getLastUpdated());
        return dto;
    }

    @Override
    public List<UtilizationAnalyticsDTO> getUtilizationAnalytics() {

        List<Equipment> equipList = equipRepo.findAll();

        List<UtilizationAnalyticsDTO> responseList = new ArrayList<>();

        // equipment is not usable 24 hours a day, lab operating hours are used for the % calculation
        double operationalHoursPerDay = 8.0;

        for (Equipment equip : equipList) {

            List<Booking> bookingList = bookingRepo.findByEquipment(equip);

            long bookingCount = 0;

            for (Booking booking : bookingList) {

                if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.COMPLETED) {
                    bookingCount++;
                }
            }

            List<Utilization> utilList = utilRepo.findByEquipment(equip);

            double usageHours = 0;

            for (Utilization util : utilList) {

                if (util.getUsageHours() != null) {
                    usageHours += util.getUsageHours();
                }

                // active utilization has not ended yet, calculate its usage so far
                else if (util.getStatus() == UtilizationStatus.ACTIVE) {

                    LocalDateTime endTime = LocalDateTime.now();

                    if (endTime.isAfter(util.getBooking().getEndTime())) {
                        endTime = util.getBooking().getEndTime();
                    }

                    long minutes = Duration.between(util.getStartTime(), endTime).toMinutes();

                    if (minutes > 0) {
                        usageHours += minutes / 60.0;
                    }
                }
            }

            double utilizationPercentage = (usageHours / operationalHoursPerDay) * 100;

            double idleHours = operationalHoursPerDay - usageHours;

            if (idleHours < 0) {
                idleHours = 0;
            }

            UtilizationAnalyticsDTO dto = new UtilizationAnalyticsDTO();

            dto.setEquipId(equip.getEquipId());
            dto.setEquipName(equip.getEquipName());
            dto.setUtilizationPercentage(utilizationPercentage);
            dto.setTotalUsageHours(usageHours);
            dto.setIdleHours(idleHours);
            dto.setBookingCount(bookingCount);

            responseList.add(dto);
        }

        return responseList;
    }

    /*
     * When equipment goes back to AVAILABLE, check the waitlist for that
     * equipment and pick up whoever is first in line. This does not
     * auto confirm anything, approval still has to happen separately.
     */
    private void notifyNextInWaitlist(Equipment equip) {

        List<BookingWaitlist> waiting = waitlistRepo.findByBooking_EquipmentAndActiveTrueOrderByAddedAtAsc(equip);

        if (waiting.isEmpty()) {
            return;
        }

        BookingWaitlist nextInLine = waiting.get(0);
        UserEntity nextUser = nextInLine.getBooking().getRequestedBy();

        // TODO: hook this up to the notification module once it is built (Milestone 3)
        System.out.println("Equipment " + equip.getEquipName() + " is now available. Next in waitlist: " + nextUser.getEmail());
    }
}
