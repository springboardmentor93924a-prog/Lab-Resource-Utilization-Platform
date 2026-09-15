package com.labresource.backend.department.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentCreateRequestDto {

    @NotBlank(message = "Department name is required.")
    @Size(max = 100, message = "Department name must not exceed 100 characters.")
    private String name;

    @NotBlank(message = "Department code is required.")
    @Size(max = 50, message = "Department code must not exceed 50 characters.")
    private String code;

    @NotEmpty(message = "At least one laboratory is required.")
    @Valid
    private List<LaboratoryCreateRequestDto> laboratories;
}
