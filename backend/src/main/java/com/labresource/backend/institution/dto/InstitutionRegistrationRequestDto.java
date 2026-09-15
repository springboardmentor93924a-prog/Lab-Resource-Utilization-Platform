package com.labresource.backend.institution.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionRegistrationRequestDto {
    @NotBlank(message = "Institution name is required")
    private String name;

    @NotBlank(message = "Institution code is required")
    private String code;

    private String institutionType;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country = "India";
    private String officialEmail;
    private String officialPhone;
    private String website;
    private String description;
    private String logoUrl;

    // Optional Admin Credentials to auto-provision initial Institution Admin
    private String adminEmail;
    private String adminPassword;
    private String adminFirstName;
    private String adminLastName;
    private String adminPhone;
}
