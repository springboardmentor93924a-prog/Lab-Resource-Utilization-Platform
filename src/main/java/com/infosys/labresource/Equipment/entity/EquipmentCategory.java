package com.infosys.labresource.Equipment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Data
@Getter
@Setter
public class EquipmentCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

   @Column(nullable = false)
    private String categoryName;

    @OneToMany(mappedBy = "category")
    private List<Equipment> equipments;
}
