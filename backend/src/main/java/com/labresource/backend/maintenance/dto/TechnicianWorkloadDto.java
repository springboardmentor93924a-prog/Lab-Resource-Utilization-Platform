package com.labresource.backend.maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianWorkloadDto {
    private Long technicianId;
    private String firstName;
    private String lastName;
    private String email;
    private long activeWorkload;

    public Long getUserId() {
        return technicianId;
    }

    public String getFullName() {
        if (firstName == null && lastName == null) return email;
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }
}
