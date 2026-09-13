package com.labresource.dto;

public class ProfileResponse {

    private Long id;

    private String fullName;

    private String email;

    private String role;

    private Long institutionId;

    private String institutionName;

    private Long departmentId;

    private String departmentName;


    public ProfileResponse() {
    }


    public ProfileResponse(
            Long id,
            String fullName,
            String email,
            String role,
            Long institutionId,
            String institutionName,
            Long departmentId,
            String departmentName
    ) {

        this.id =
                id;

        this.fullName =
                fullName;

        this.email =
                email;

        this.role =
                role;

        this.institutionId =
                institutionId;

        this.institutionName =
                institutionName;

        this.departmentId =
                departmentId;

        this.departmentName =
                departmentName;
    }


    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }
}