package com.labplatform.auth.dto;

public class MeResponse {

    private String id;
    private String fullName;
    private String email;
    private String role;
    private Integer institutionId;
    private String institutionName;

    public MeResponse() {
    }

    public MeResponse(String id, String fullName, String email, String role,
                      Integer institutionId, String institutionName) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.institutionId = institutionId;
        this.institutionName = institutionName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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