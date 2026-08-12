package com.infosys.labresource.booking.service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.Repository.BookingWaitlistRepository;
import com.infosys.labresource.booking.dtos.WaitlistResponseDTO;
import com.infosys.labresource.booking.entity.BookingWaitlist;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class WaitlistServiceImpl implements WailtlistService{
    private final BookingWaitlistRepository waitlistRepo;
    private final EquipmentRepository equipRepo;
    @Override
    public List<WaitlistResponseDTO> getAllWaitlistEntries() {

        List<BookingWaitlist> waitlistEntries = waitlistRepo.findByActiveTrueOrderByAddedAtAsc();
        List<WaitlistResponseDTO> responseList = new ArrayList<>();
        int position = 1;
        for (BookingWaitlist waitlist : waitlistEntries) {

            responseList.add(
                    convertToDTO(waitlist, position)
            );
            position++;
        }
        return responseList;
    }

    @Override
    public WaitlistResponseDTO getWaitlistById(
            Long waitlistId) {
        BookingWaitlist waitlist = waitlistRepo.findById(waitlistId).orElseThrow(() -> new RuntimeException("Waitlist entry not found."));

        /*
         * Position is calculated only among
         * active waitlist entries for the same equipment.
         */
        List<BookingWaitlist> equipmentWaitlist = waitlistRepo.findByBooking_EquipmentAndActiveTrueOrderByAddedAtAsc(
                                waitlist.getBooking().getEquipment()
                        );
        int position = 1;
        for (BookingWaitlist entry : equipmentWaitlist) {
            if (entry.getWaitlistId().equals(waitlist.getWaitlistId())) {
                break;
            }
            position++;
        }
        return convertToDTO(waitlist, position);
    }

    @Override
    public List<WaitlistResponseDTO> getWaitlistByEquipment(Long equipmentId) {
        Equipment equipment = equipRepo.findById(equipmentId).orElseThrow(() -> new RuntimeException("Equipment not found."));

        List<BookingWaitlist> waitlistEntries = waitlistRepo.findByBooking_EquipmentAndActiveTrueOrderByAddedAtAsc(
                                equipment
                        );
        List<WaitlistResponseDTO> responseList = new ArrayList<>();
        int position = 1;
        for (BookingWaitlist waitlist : waitlistEntries) {
            responseList.add(
                    convertToDTO(waitlist, position)
            );
            position++;
        }
        return responseList;
    }

    private WaitlistResponseDTO convertToDTO(BookingWaitlist waitlist, int position) {
       WaitlistResponseDTO dto = new WaitlistResponseDTO();
        dto.setWaitlistId(waitlist.getWaitlistId());
        dto.setBookingId(waitlist.getBooking().getBookingId());
        dto.setEquipId(waitlist.getBooking().getEquipment().getEquipId());
        dto.setRequestedById(waitlist.getBooking().getRequestedBy().getUserId());
        dto.setStartTime(waitlist.getBooking().getStartTime());

        dto.setEndTime(waitlist.getBooking().getEndTime());

        dto.setAddedAt(waitlist.getAddedAt());
        dto.setPosition(position);
        dto.setActive(waitlist.getActive());
        return dto;
    }
}