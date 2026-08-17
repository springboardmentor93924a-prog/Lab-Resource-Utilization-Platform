package com.example.lab_platform.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "institution_departments",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "institution_id",
                                "department_id"
                        }
                )
        }
)
public class InstitutionDepartment {

    @EmbeddedId
    private InstitutionDepartmentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("institutionId")
    @JoinColumn(
            name = "institution_id",
            nullable = false
    )
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("departmentId")
    @JoinColumn(
            name = "department_id",
            nullable = false
    )
    private Department department;

    public InstitutionDepartment() {
    }

    public InstitutionDepartment(
            Institution institution,
            Department department) {

        this.institution = institution;
        this.department = department;

        this.id = new InstitutionDepartmentId(
                institution.getInstitutionId(),
                department.getDepartmentId()
        );
    }

    public InstitutionDepartmentId getId() {
        return id;
    }

    public void setId(InstitutionDepartmentId id) {
        this.id = id;
    }

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}