package com.labresource.backend.invitation.dto;

import com.labresource.backend.invitation.entity.StaffInvitation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffInvitationResponseDto {

    private Long invitationId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Long institutionId;
    private String institutionName;
    private Long departmentId;
    private String departmentName;
    private String roleName;
    private String status;
    private String token;
    private String setupUrl;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public static StaffInvitationResponseDto fromEntity(StaffInvitation inv, String institutionName, String departmentName) {
        return fromEntity(inv, null, null, institutionName, departmentName);
    }

    public static StaffInvitationResponseDto fromEntity(StaffInvitation inv, String rawToken, String setupUrl, String institutionName, String departmentName) {
        if (inv == null) return null;
        StaffInvitationResponseDto dto = new StaffInvitationResponseDto();
        dto.setInvitationId(inv.getInvitationId());
        dto.setFullName(inv.getFullName());
        dto.setEmail(inv.getEmail());
        dto.setPhoneNumber(inv.getPhoneNumber());
        dto.setInstitutionId(inv.getInstitutionId());
        dto.setInstitutionName(institutionName);
        dto.setDepartmentId(inv.getDepartmentId());
        dto.setDepartmentName(departmentName);
        dto.setRoleName(inv.getRoleName());
        dto.setStatus(inv.getStatus());
        dto.setToken(rawToken);
        dto.setSetupUrl(setupUrl);
        dto.setExpiresAt(inv.getExpiresAt());
        dto.setCreatedAt(inv.getCreatedAt());
        return dto;
    }
}
