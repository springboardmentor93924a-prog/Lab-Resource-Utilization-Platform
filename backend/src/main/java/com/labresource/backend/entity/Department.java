package com.labresource.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @Column(name = "department_code", nullable = false, length = 20)
    private String departmentCode;

    @Column(name = "description", length = 255)
    private String description;

    // Default Constructor
    public Department() {
    }

    // Parameterized Constructor
    public Department(Long departmentId,
                      Long institutionId,
                      String departmentName,
                      String departmentCode,
                      String description) {

        this.departmentId = departmentId;
        this.institutionId = institutionId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.description = description;
    }

    // Getters and Setters

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}