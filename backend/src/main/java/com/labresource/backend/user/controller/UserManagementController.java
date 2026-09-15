package com.labresource.backend.user.controller;

import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.user.dto.InstitutionStaffRosterDto;
import com.labresource.backend.user.dto.StaffMemberDto;
import com.labresource.backend.user.dto.StudentDetailsDto;
import com.labresource.backend.user.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping("/staff-roster")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'MANAGE_USERS', 'VIEW_STAFF')")
    public InstitutionStaffRosterDto getStaffRoster(@AuthenticationPrincipal UserPrincipal principal) {
        return userManagementService.getInstitutionStaffRoster(principal);
    }

    @GetMapping("/staff/{userId}")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'MANAGE_USERS', 'VIEW_STAFF')")
    public StaffMemberDto getStaffDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId) {
        return userManagementService.getStaffDetails(principal, userId);
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'MANAGE_USERS')")
    public List<StudentDetailsDto> getStudents(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) Long departmentId) {
        return userManagementService.getStudents(principal, activeOnly, departmentId);
    }

    @GetMapping("/students/{userId}")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'MANAGE_USERS')")
    public StudentDetailsDto getStudentDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId) {
        return userManagementService.getStudentDetails(principal, userId);
    }

    @PostMapping("/verify-institution-admin/{userId}")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public Map<String, String> verifyInstitutionAdmin(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId) {
        return userManagementService.verifyInstitutionAdmin(principal.getUserId(), userId);
    }

    @PostMapping("/reject-institution/{institutionId}")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public Map<String, String> rejectInstitution(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long institutionId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return userManagementService.rejectInstitution(principal.getUserId(), institutionId, reason);
    }

    @PostMapping("/approve-student/{userId}")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public Map<String, String> approveStudent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId) {
        return userManagementService.approveStudent(principal.getUserId(), userId);
    }

    @PostMapping("/reject-student/{userId}")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public Map<String, String> rejectStudent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        userManagementService.rejectStudent(principal, userId, reason);
        return Map.of("message", "Student registration rejected.");
    }

    @PostMapping("/assign-department-role")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public Map<String, String> assignDepartmentRole(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long userId,
            @RequestParam Long departmentId,
            @RequestParam String role) {
        userManagementService.assignDepartmentRole(principal.getUserId(), userId, departmentId, role);
        return Map.of("message", "Role " + role + " successfully assigned to the user within the department.");
    }

    @PostMapping("/deactivate-staff/{userId}")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'MANAGE_USERS')")
    public Map<String, String> deactivateStaff(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        userManagementService.deactivateStaff(principal, userId, reason);
        return Map.of("message", "Staff account deactivated successfully.");
    }
}
