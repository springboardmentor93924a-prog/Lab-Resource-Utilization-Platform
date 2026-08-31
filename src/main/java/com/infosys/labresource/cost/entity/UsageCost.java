package com.infosys.labresource.cost.entity;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsageCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long costId;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equip_id")
    private Equipment equipment;

    // department/institution that actually used the equipment (the requester side)
    @ManyToOne
    @JoinColumn(name = "used_by_department")
    private Department usedByDepartment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "used_by_institution")
    private Institution usedByInstitution;

    // institution that owns the equipment, same as usedByInstitution unless it was an external booking
    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_institution")
    private Institution ownerInstitution;

    private Double hoursUsed;

    private BigDecimal hourlyRate;

    private BigDecimal totalCost;

    private boolean crossInstitution;

    private LocalDateTime createdAt;
}
