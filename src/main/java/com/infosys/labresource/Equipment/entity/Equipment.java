package com.infosys.labresource.Equipment.entity;

import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Equipment{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long EquipId;
    @Column(nullable = false)
    private String EquipName;
    @Column(unique = true)
    private String assetTag;
    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id")
    private EquipmentCategory category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @ManyToOne(optional = false)
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentStatus status = EquipmentStatus.AVAILABLE;

    private BigDecimal hourlyRate;
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost", precision = 12, scale = 2)
    private BigDecimal purchaseCost;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;
}
