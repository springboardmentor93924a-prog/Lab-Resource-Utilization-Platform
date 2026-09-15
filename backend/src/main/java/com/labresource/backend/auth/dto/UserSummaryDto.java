package com.labresource.backend.auth.dto;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.role.entity.Role;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserSummaryDto {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Long institutionId;
    private String institutionName;
    private String institutionCode;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String profilePictureSecureUrl;
    private Boolean isActive;
    private String rollNumber;
    private String researcherId;
    private java.time.LocalDateTime deactivatedAt;
    private String deactivationReason;
    private List<String> roles;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private java.time.LocalDateTime createdAt;

    public static UserSummaryDto fromEntity(AppUser user) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setUserId(user.getUserId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setInstitutionId(user.getInstitutionId());
        dto.setDepartmentId(user.getDepartmentId());
        dto.setProfilePictureSecureUrl(user.getProfilePictureSecureUrl());
        dto.setIsActive(user.getIsActive());
        dto.setIsEmailVerified(user.getIsEmailVerified());
        dto.setIsPhoneVerified(user.getIsPhoneVerified());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRollNumber(user.getRollNumber());
        dto.setResearcherId(user.getResearcherId());
        dto.setDeactivatedAt(user.getDeactivatedAt());
        dto.setDeactivationReason(user.getDeactivationReason());
        dto.setRoles(user.getRoles().stream().map(Role::getRoleName).collect(Collectors.toList()));
        return dto;
    }
}
