package com.labresource.backend.user.dto;

import com.labresource.backend.auth.entity.AppUser;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentDetailsDto {
    private Long userId;
    private Long institutionId;
    private String institutionName;
    private Long departmentId;
    private String departmentName;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private String profilePictureSecureUrl;
    private String rollNumber;
    private String researcherId;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private Long activeBookingsCount;
    private java.math.BigDecimal totalDamageCharges;
    private LocalDateTime createdAt;

    public static StudentDetailsDto fromEntity(AppUser user, String institutionName, String departmentName, Long activeBookingsCount, java.math.BigDecimal totalDamageCharges) {
        if (user == null) return null;
        StudentDetailsDto dto = new StudentDetailsDto();
        dto.setUserId(user.getUserId());
        dto.setInstitutionId(user.getInstitutionId());
        dto.setInstitutionName(institutionName);
        dto.setDepartmentId(user.getDepartmentId());
        dto.setDepartmentName(departmentName);
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName((user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setIsActive(user.getIsActive());
        dto.setIsEmailVerified(user.getIsEmailVerified());
        dto.setProfilePictureSecureUrl(user.getProfilePictureSecureUrl());
        dto.setRollNumber(user.getRollNumber());
        dto.setResearcherId(user.getResearcherId());
        dto.setReviewedBy(user.getReviewedBy());
        dto.setReviewedAt(user.getReviewedAt());
        dto.setRejectionReason(user.getRejectionReason());
        dto.setActiveBookingsCount(activeBookingsCount != null ? activeBookingsCount : 0L);
        dto.setTotalDamageCharges(totalDamageCharges != null ? totalDamageCharges : java.math.BigDecimal.ZERO);
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
