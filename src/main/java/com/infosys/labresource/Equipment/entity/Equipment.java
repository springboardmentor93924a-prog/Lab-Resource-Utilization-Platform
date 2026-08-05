package com.infosys.labresource.Equipment.entity;

import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Equipment{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Equip_id;
    @Column(nullable = false)
    private String Equip_name;
    @Column(unique = true)
    private String asset_tag;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private EquipmentCategory category;

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    @Enumerated(EnumType.STRING)
    private EquipmentStatus status;
    private BigDecimal hourly_rate;
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost", precision = 12, scale = 2)
    private BigDecimal purchaseCost;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;
}
