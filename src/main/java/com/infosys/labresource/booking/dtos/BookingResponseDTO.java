package com.infosys.labresource.booking.dtos;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.entity.BookingStatus;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class BookingResponseDTO {

    private Long bookingId;
    private Long equipId;
    private String equipmentName;
    private Long requestedById;
    private Long approvedById;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
}
