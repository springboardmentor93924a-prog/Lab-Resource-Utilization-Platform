package com.example.lab_platform.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class InstitutionDepartmentId implements Serializable {

    private Integer institutionId;
    private Integer departmentId;

    public InstitutionDepartmentId() {
    }

    public InstitutionDepartmentId(
            Integer institutionId,
            Integer departmentId) {
        this.institutionId = institutionId;
        this.departmentId = departmentId;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (!(o instanceof InstitutionDepartmentId)) {
            return false;
        }

        InstitutionDepartmentId that =
                (InstitutionDepartmentId) o;

        return Objects.equals(institutionId, that.institutionId)
                && Objects.equals(departmentId, that.departmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(institutionId, departmentId);
    }
}