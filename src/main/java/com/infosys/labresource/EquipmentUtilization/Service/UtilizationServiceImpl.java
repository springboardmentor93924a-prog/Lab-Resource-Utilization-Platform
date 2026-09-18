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
import com.infosys.labresource.booking.entity.*;
import com.infosys.labresource.booking.Repository.BookingWaitlistRepository;
import com.infosys.labresource.cost.service.CostService;
import com.infosys.labresource.notification.Repository.NotificationRepository;
import com.infosys.labresource.notification.entity.NotificationType;
import com.infosys.labresource.notification.service.NotificationService;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Role;
import org.springframework.security.access.AccessDeniedException;
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
    private final NotificationService notifService;
    private final CostService costService;
    private final UserRepository userRepo;
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

        // usage just got completed, this is what actually creates the billable cost row
        costService.generateCost(updatedUtil);

        // equipment just got freed up, check if someone is waiting for it
        notifyNextInWaitlist(equip);

        return convertToDTO(updatedUtil);
    }

    @Override
    public List<UtilizationResponseDTO> getAllUtilization(String email) {

        List<Equipment> scopedEquip = getScopedEquipment(email);

        List<UtilizationResponseDTO> responseList = new ArrayList<>();

        // same per-equipment loop pattern already used below in analytics,
        // this way no new "find by list of equipment" query is needed
        for (Equipment equip : scopedEquip) {

            List<Utilization> utilList = utilRepo.findByEquipment(equip);

            for (Utilization util : utilList) {
                responseList.add(convertToDTO(util));
            }
        }

        return responseList;
    }

    @Override
    public UtilizationResponseDTO getUtilizationById(Long utilizationId, String email) {

        Utilization util = utilRepo.findById(utilizationId)
                .orElseThrow(() -> new RuntimeException("Utilization record not found."));

        UserEntity caller = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!isInCallerScope(util.getEquipment(), caller)) {
            throw new AccessDeniedException("You are not authorized to view this utilization record.");
        }

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
    public List<UtilizationAnalyticsDTO> getUtilizationAnalytics(String email) {

        List<Equipment> equipList = getScopedEquipment(email);

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
            dto.setDepartmentId(equip.getDepartment().getDepartId());
            dto.setDepartmentName(equip.getDepartment().getDepartmentName());
            dto.setInstitutionId(equip.getInstitution().getInstitutionId());
            dto.setInstitutionName(equip.getInstitution().getInstitutionName());
            dto.setUtilizationPercentage(utilizationPercentage);
            dto.setTotalUsageHours(usageHours);
            dto.setIdleHours(idleHours);
            dto.setBookingCount(bookingCount);

            responseList.add(dto);
        }

        return responseList;
    }

    /*
     * This is the actual fix for the cross-department leak. Instead of
     * equipRepo.findAll(), the caller's own role decides what they can see:
     * SYSTEM_ADMIN -> everything, INSTITUTION_ADMIN -> their institution,
     * everyone else (department head, lab manager, lab technician) -> their
     * own department only. Nothing here comes from the request, all of it
     * comes from the authenticated user's own row in the database.
     */
    private List<Equipment> getScopedEquipment(String email) {

        UserEntity caller = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (caller.getRole() == Role.SYSTEM_ADMIN) {
            return equipRepo.findAll();
        }

        if (caller.getRole() == Role.INSTITUTION_ADMIN) {
            return equipRepo.findByInstitution(caller.getInstitution());
        }

        // department head, lab manager, lab technician all get their own department's scope.
        // filtering on department alone isn't enough - equipment can have a department
        // and institution that don't actually match each other (bad data from equipment
        // creation), so both have to match the caller's own institution too, otherwise
        // equipment from a different institution can leak in through a shared department id.
        List<Equipment> deptEquip = equipRepo.findByDepartment(caller.getDepartment());
        List<Equipment> scoped = new ArrayList<>();

        for (Equipment equip : deptEquip) {
            if (equip.getInstitution().getInstitutionId().equals(caller.getInstitution().getInstitutionId())) {
                scoped.add(equip);
            }
        }

        return scoped;
    }

    private boolean isInCallerScope(Equipment equip, UserEntity caller) {

        if (caller.getRole() == Role.SYSTEM_ADMIN) {
            return true;
        }

        if (caller.getRole() == Role.INSTITUTION_ADMIN) {
            return equip.getInstitution().getInstitutionId().equals(caller.getInstitution().getInstitutionId());
        }

        return equip.getDepartment().getDepartId().equals(caller.getDepartment().getDepartId());
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

        String msg = "Equipment " + equip.getEquipName() + " is now available, you are next in the waitlist.";

        notifService.send(nextUser, msg, NotificationType.WAITLIST);
    }
}