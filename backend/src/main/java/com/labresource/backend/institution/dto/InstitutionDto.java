package com.labresource.backend.institution.dto;

import com.labresource.backend.institution.entity.Institution;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionDto {
    private Long institutionId;
    private String name;
    private String code;
    private String institutionType;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String website;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private String logoPublicId;
    private String logoSecureUrl;
    private String logoFileName;
    private String approvalStatus;
    private String rejectionReason;
    private Boolean isActive;
    private Long reviewedBy;
    private java.time.LocalDateTime reviewedAt;
    private java.time.LocalDateTime createdAt;

    // Designated Administrator Details (non-sensitive)
    private Long adminUserId;
    private String adminFirstName;
    private String adminLastName;
    private String adminEmail;
    private String adminPhone;

    public static InstitutionDto fromEntity(Institution i) {
        if (i == null) return null;
        InstitutionDto dto = new InstitutionDto();
        dto.setInstitutionId(i.getInstitutionId());
        dto.setName(i.getName());
        dto.setCode(i.getCode());
        dto.setInstitutionType(i.getInstitutionType());
        dto.setAddress(i.getAddress());
        dto.setCity(i.getCity());
        dto.setState(i.getState());
        dto.setPincode(i.getPincode());
        dto.setCountry(i.getCountry() != null ? i.getCountry() : "India");
        dto.setWebsite(i.getWebsite());
        dto.setDescription(i.getDescription());
        dto.setContactEmail(i.getContactEmail());
        dto.setContactPhone(i.getContactPhone());
        dto.setLogoPublicId(i.getLogoPublicId());
        dto.setLogoSecureUrl(i.getLogoSecureUrl());
        dto.setLogoFileName(i.getLogoFileName());
        dto.setApprovalStatus(i.getApprovalStatus());
        dto.setRejectionReason(i.getRejectionReason());
        dto.setIsActive(i.getIsActive());
        dto.setReviewedBy(i.getReviewedBy());
        dto.setReviewedAt(i.getReviewedAt());
        dto.setCreatedAt(i.getCreatedAt());
        return dto;
    }
}
