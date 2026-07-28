package com.example.lab_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String roomNumber;

    @Column(nullable = false, length = 100)
    private String blockBuilding;

    private Integer capacity = 30;
}
