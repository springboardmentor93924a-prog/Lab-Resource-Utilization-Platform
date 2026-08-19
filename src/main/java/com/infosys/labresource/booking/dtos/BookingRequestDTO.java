package com.infosys.labresource.booking.dtos;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class BookingRequestDTO {
   // private Long bookingId;
   private Long equipId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
