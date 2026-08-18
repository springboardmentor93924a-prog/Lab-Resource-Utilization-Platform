package com.example.lab_platform.dto;

public class DepartmentLinkRequest {
    private Integer departmentId;   // set this to reuse an existing catalog department
    private String departmentName;  // or set this to create+link a brand-new one

    public Integer getDepartmentId() { return departmentId; }
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
}