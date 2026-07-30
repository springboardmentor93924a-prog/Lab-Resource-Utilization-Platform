package com.labresource.dto.institution;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionRequest {

    @NotBlank(message = "Institution name is required")
    private String name;

    @Email(message = "Enter a valid email address")
    private String email;

    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Phone number must contain exactly 10 digits"
    )
    private String phone;

    private String address;

    private String city;

    private String state;

    private String country;

    private String status;
}


//requirement
//{
//        "name": "DY Patil International University",
//        "email": "admin@dypiu.ac.in",
//        "phone": "9876543210",
//        "address": "Akurdi",
//        "city": "Pune",
//        "state": "Maharashtra",
//        "country": "India",
//        "status": "ACTIVE"
//        }