package com.labresource.backend.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LaboratoryCreateRequestDto {

    @NotBlank(message = "Laboratory name is required.")
    @Size(max = 150, message = "Laboratory name must not exceed 150 characters.")
    private String name;

    @NotBlank(message = "Laboratory location is required.")
    @Size(max = 150, message = "Laboratory location must not exceed 150 characters.")
    private String location;

    private String description;
    private Integer capacity;
}
