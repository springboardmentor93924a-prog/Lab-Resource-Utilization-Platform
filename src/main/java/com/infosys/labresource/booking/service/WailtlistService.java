package com.infosys.labresource.booking.service;

import com.infosys.labresource.booking.dtos.WaitlistResponseDTO;
import com.infosys.labresource.booking.entity.BookingWaitlist;

import java.util.List;

public interface WailtlistService {
    List<WaitlistResponseDTO> getAllWaitlistEntries();

WaitlistResponseDTO getWaitlistById(Long waitlistId);

    List<WaitlistResponseDTO> getWaitlistByEquipment(Long equipmentId);
}
