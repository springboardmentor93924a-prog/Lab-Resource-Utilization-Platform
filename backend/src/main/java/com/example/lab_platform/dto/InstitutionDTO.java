package com.example.lab_platform.dto;

public class InstitutionDTO {

    private Integer institutionId;
    private String institutionName;

    public InstitutionDTO() {
    }

    public InstitutionDTO(Integer institutionId, String institutionName) {
        this.institutionId = institutionId;
        this.institutionName = institutionName;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }
}