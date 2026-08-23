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
}
