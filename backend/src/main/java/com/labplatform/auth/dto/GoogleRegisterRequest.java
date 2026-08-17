package com.labplatform.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleRegisterRequest {

    @NotBlank
    private String role;

    @NotBlank
    private String institutionId;

    private String departmentId;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }
}