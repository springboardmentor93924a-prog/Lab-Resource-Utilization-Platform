package com.labresource.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    private String phone;

    @NotNull(message = "Institution is required")
    private Long institutionId;

    @NotNull(message = "Department is required")
    private Long departmentId;

    private String rollNumber;

    private String researcherId;

    private String role = "STUDENT"; // STUDENT or RESEARCHER
}
