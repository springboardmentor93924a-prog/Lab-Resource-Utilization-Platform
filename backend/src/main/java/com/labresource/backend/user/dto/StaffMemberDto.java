package com.labresource.backend.user.dto;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.invitation.entity.StaffInvitation;
import com.labresource.backend.role.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffMemberDto {
    private Long userId;
    private Long invitationId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;

    private Long institutionId;
    private String institutionName;
    private String institutionCode;

    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    private String role;
    private String roleLabel;

    private String status; // ACTIVE, INVITED / PENDING_SETUP, INACTIVE
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private String invitationStatus; // ACCEPTED, PENDING, CANCELLED, etc.

    private String profilePictureSecureUrl;
    private LocalDateTime deactivatedAt;
    private String deactivationReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime invitedAt;
    private LocalDateTime acceptedAt;

    public static String formatRoleLabel(String roleName) {
        if (roleName == null) return "Staff Member";
        return switch (roleName.toUpperCase()) {
            case "DEPARTMENT_HEAD" -> "Department Head";
            case "LAB_MANAGER" -> "Lab Manager";
            case "LAB_TECHNICIAN", "TECHNICIAN" -> "Lab Technician";
            case "INSTITUTION_ADMIN" -> "Institution Admin";
            case "SYSTEM_ADMIN" -> "System Admin";
            case "RESEARCHER" -> "Student / Researcher";
            default -> roleName.replace("_", " ");
        };
    }

    public static StaffMemberDto fromAppUser(
            AppUser user,
            String institutionName,
            String institutionCode,
            String departmentName,
            String departmentCode) {
        if (user == null) return null;

        String primaryRole = user.getRoles().stream()
                .map(Role::getRoleName)
                .filter(r -> "DEPARTMENT_HEAD".equalsIgnoreCase(r) || "LAB_MANAGER".equalsIgnoreCase(r) || "LAB_TECHNICIAN".equalsIgnoreCase(r) || "TECHNICIAN".equalsIgnoreCase(r))
                .findFirst()
                .orElseGet(() -> user.getRoles().stream().map(Role::getRoleName).findFirst().orElse("STAFF"));

        if ("TECHNICIAN".equalsIgnoreCase(primaryRole)) {
            primaryRole = "LAB_TECHNICIAN";
        }

        String fn = user.getFirstName() != null ? user.getFirstName() : "";
        String ln = user.getLastName() != null ? user.getLastName() : "";
        String full = (fn + " " + ln).trim();

        String status;
        if (Boolean.TRUE.equals(user.getIsActive())) {
            status = "ACTIVE";
        } else if (user.getRejectionReason() != null && !user.getRejectionReason().isBlank()) {
            status = "REJECTED";
        } else if (user.getPasswordHash() == null) {
            status = "PENDING_SETUP";
        } else {
            status = "INACTIVE";
        }

        return StaffMemberDto.builder()
                .userId(user.getUserId())
                .invitationId(null)
                .firstName(fn)
                .lastName(ln)
                .fullName(full.isEmpty() ? user.getEmail() : full)
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .institutionId(user.getInstitutionId())
                .institutionName(institutionName)
                .institutionCode(institutionCode)
                .departmentId(user.getDepartmentId())
                .departmentName(departmentName)
                .departmentCode(departmentCode)
                .role(primaryRole)
                .roleLabel(formatRoleLabel(primaryRole))
                .status(status)
                .isEmailVerified(Boolean.TRUE.equals(user.getIsEmailVerified()))
                .isPhoneVerified(Boolean.TRUE.equals(user.getIsPhoneVerified()))
                .invitationStatus(Boolean.TRUE.equals(user.getIsInvitationAccepted()) ? "ACCEPTED" : "ACTIVE")
                .profilePictureSecureUrl(user.getProfilePictureSecureUrl())
                .deactivatedAt(user.getDeactivatedAt())
                .deactivationReason(user.getDeactivationReason())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .invitedAt(null)
                .acceptedAt(null)
                .build();
    }

    public static StaffMemberDto fromStaffInvitation(
            StaffInvitation invitation,
            String institutionName,
            String institutionCode,
            String departmentName,
            String departmentCode) {
        if (invitation == null) return null;

        String fullName = invitation.getFullName() != null ? invitation.getFullName().trim() : "";
        String fn = fullName;
        String ln = "";
        int spaceIdx = fullName.indexOf(' ');
        if (spaceIdx > 0) {
            fn = fullName.substring(0, spaceIdx);
            ln = fullName.substring(spaceIdx + 1);
        }

        String role = invitation.getRoleName();
        if ("TECHNICIAN".equalsIgnoreCase(role)) {
            role = "LAB_TECHNICIAN";
        }

        return StaffMemberDto.builder()
                .userId(null)
                .invitationId(invitation.getInvitationId())
                .firstName(fn)
                .lastName(ln)
                .fullName(fullName.isEmpty() ? invitation.getEmail() : fullName)
                .email(invitation.getEmail())
                .phoneNumber(invitation.getPhoneNumber())
                .institutionId(invitation.getInstitutionId())
                .institutionName(institutionName)
                .institutionCode(institutionCode)
                .departmentId(invitation.getDepartmentId())
                .departmentName(departmentName)
                .departmentCode(departmentCode)
                .role(role)
                .roleLabel(formatRoleLabel(role))
                .status("INVITED")
                .isEmailVerified(false)
                .isPhoneVerified(false)
                .invitationStatus(invitation.getStatus())
                .profilePictureSecureUrl(null)
                .deactivatedAt(null)
                .deactivationReason(null)
                .createdAt(invitation.getCreatedAt())
                .updatedAt(invitation.getUpdatedAt())
                .invitedAt(invitation.getCreatedAt())
                .acceptedAt(invitation.getAcceptedAt())
                .build();
    }
}
