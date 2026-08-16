package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Integer institutionId;

    @Column(name = "institution_name", nullable = false, unique = true, length = 150)
    private String institutionName;

    @Column(name = "location", length = 200)
    private String location;

    @OneToMany(
            mappedBy = "institution",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<InstitutionDepartment> institutionDepartments = new HashSet<>();

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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Set<InstitutionDepartment> getInstitutionDepartments() {
        return institutionDepartments;
    }

    public void setInstitutionDepartments(
            Set<InstitutionDepartment> institutionDepartments) {
        this.institutionDepartments = institutionDepartments;
    }
}