package com.infosys.labresource.EquipmentUtilization.Service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationResponseDTO;
import com.infosys.labresource.EquipmentUtilization.Entity.Utilization;
import com.infosys.labresource.EquipmentUtilization.Entity.UtilizationStatus;
import com.infosys.labresource.EquipmentUtilization.Repository.EquipmentUtilizationRepository;
import com.infosys.labresource.booking.Repository.BookingRepository;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.booking.entity.BookingStatus;
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
    @Override
    public UtilizationResponseDTO startUtilization(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        Equipment equip = booking.getEquipment();

        if (equip.getStatus() != EquipmentStatus.BOOKED) {
            throw new RuntimeException("Equipment is not ready for utilization.");
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
        dto.setBookingId(util.getBooking().getBooking_id());
        dto.setEquipId(util.getEquipment().getEquipId());
        dto.setStartTime(util.getStartTime());
        dto.setEndTime(util.getEndTime());
        dto.setUsageHours(util.getUsageHours());
        dto.setStatus(util.getStatus());
        dto.setLastUpdated(util.getLastUpdated());
        return dto;
    }
}
