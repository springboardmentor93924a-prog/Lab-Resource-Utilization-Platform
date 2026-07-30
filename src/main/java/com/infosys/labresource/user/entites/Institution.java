package com.infosys.labresource.user.entites;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Institution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long institutionId;

    @Column(nullable = false, unique = true)
    private String institutionName;

    @Column(nullable = false, unique = true)
    private String institutionCode;

    private String address;

    private String city;

    private String state;

    private String country;

    private String pincode;

    private String contactEmail;

    private String contactPhone;
}
