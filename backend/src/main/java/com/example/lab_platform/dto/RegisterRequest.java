package com.example.lab_platform.dto;

public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private String phone;

    private Integer institutionId;
    private Integer departmentId;
    private Integer roleId;

    // Only used by an Institution Admin whose college is not in the list
    // yet: the System Admin creates the institution when approving.
    private String newInstitutionName;
    private String newInstitutionLocation;

    public RegisterRequest() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public Integer getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getNewInstitutionName() {
        return newInstitutionName;
    }

    public void setNewInstitutionName(String newInstitutionName) {
        this.newInstitutionName = newInstitutionName;
    }

    public String getNewInstitutionLocation() {
        return newInstitutionLocation;
    }

    public void setNewInstitutionLocation(String newInstitutionLocation) {
        this.newInstitutionLocation = newInstitutionLocation;
    }
}