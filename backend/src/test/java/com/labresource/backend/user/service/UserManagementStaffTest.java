package com.labresource.backend.user.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.invitation.entity.StaffInvitation;
import com.labresource.backend.invitation.repository.StaffInvitationRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.user.dto.DepartmentStaffGroupDto;
import com.labresource.backend.user.dto.InstitutionStaffRosterDto;
import com.labresource.backend.user.dto.StaffMemberDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementStaffTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private StaffInvitationRepository staffInvitationRepository;

    @InjectMocks
    private UserManagementService userManagementService;

    private UserPrincipal kceAdmin;
    private Institution kceInstitution;
    private Department cseDept;
    private Department eceDept;

    private Role createRole(Long id, String name) {
        Role r = new Role();
        r.setRoleId(id);
        r.setRoleName(name);
        return r;
    }

    @BeforeEach
    void setUp() {
        Role adminRole = createRole(5L, "INSTITUTION_ADMIN");
        AppUser adminUser = new AppUser();
        adminUser.setUserId(100L);
        adminUser.setEmail("admin@kce.ac.in");
        adminUser.setInstitutionId(6L);
        adminUser.setIsActive(true);
        adminUser.setRoles(Set.of(adminRole));

        kceAdmin = new UserPrincipal(adminUser);

        kceInstitution = new Institution();
        kceInstitution.setInstitutionId(6L);
        kceInstitution.setName("Karpagam College of Engineering");
        kceInstitution.setCode("KCE");

        cseDept = new Department();
        cseDept.setDepartmentId(10L);
        cseDept.setInstitutionId(6L);
        cseDept.setName("Computer Science and Engineering");
        cseDept.setCode("CSE");

        eceDept = new Department();
        eceDept.setDepartmentId(20L);
        eceDept.setInstitutionId(6L);
        eceDept.setName("Electronics and Communication Engineering");
        eceDept.setCode("ECE");
    }

    @Test
    @DisplayName("getInstitutionStaffRoster: returns dynamic department grouping, active users, and pending invitations")
    void testGetInstitutionStaffRoster_Success() {
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(kceInstitution));
        when(departmentRepository.findByInstitutionIdAndIsActiveTrue(6L)).thenReturn(List.of(cseDept, eceDept));

        // Create Active AppUsers
        Role headRole = createRole(4L, "DEPARTMENT_HEAD");
        Role managerRole = createRole(3L, "LAB_MANAGER");

        AppUser headUser = new AppUser();
        headUser.setUserId(201L);
        headUser.setInstitutionId(6L);
        headUser.setDepartmentId(10L);
        headUser.setFirstName("Dr. Bhuvaneshwari");
        headUser.setLastName("S");
        headUser.setEmail("head.cse@kce.ac.in");
        headUser.setPhoneNumber("+919876543210");
        headUser.setIsActive(true);
        headUser.setIsEmailVerified(true);
        headUser.setRoles(Set.of(headRole));

        AppUser managerUser = new AppUser();
        managerUser.setUserId(202L);
        managerUser.setInstitutionId(6L);
        managerUser.setDepartmentId(10L);
        managerUser.setFirstName("Nivetha");
        managerUser.setLastName("S");
        managerUser.setEmail("manager.cse@kce.ac.in");
        managerUser.setIsActive(true);
        managerUser.setIsEmailVerified(true);
        managerUser.setRoles(Set.of(managerRole));

        when(appUserRepository.findByInstitutionId(6L)).thenReturn(List.of(headUser, managerUser));

        // Create Pending Staff Invitations
        StaffInvitation pendingTech1 = new StaffInvitation();
        pendingTech1.setInvitationId(501L);
        pendingTech1.setInstitutionId(6L);
        pendingTech1.setDepartmentId(10L);
        pendingTech1.setFullName("Ramesh Kumar");
        pendingTech1.setEmail("tech1.cse@kce.ac.in");
        pendingTech1.setPhoneNumber("+919876543211");
        pendingTech1.setRoleName("LAB_TECHNICIAN");
        pendingTech1.setStatus("PENDING");
        pendingTech1.setCreatedAt(LocalDateTime.now().minusDays(1));

        StaffInvitation pendingEceHead = new StaffInvitation();
        pendingEceHead.setInvitationId(502L);
        pendingEceHead.setInstitutionId(6L);
        pendingEceHead.setDepartmentId(20L);
        pendingEceHead.setFullName("Dr. ECE Head");
        pendingEceHead.setEmail("head.ece@kce.ac.in");
        pendingEceHead.setRoleName("DEPARTMENT_HEAD");
        pendingEceHead.setStatus("PENDING");
        pendingEceHead.setCreatedAt(LocalDateTime.now().minusDays(2));

        when(staffInvitationRepository.findByInstitutionId(6L)).thenReturn(List.of(pendingTech1, pendingEceHead));

        InstitutionStaffRosterDto roster = userManagementService.getInstitutionStaffRoster(kceAdmin);

        assertThat(roster).isNotNull();
        assertThat(roster.getInstitutionId()).isEqualTo(6L);
        assertThat(roster.getInstitutionName()).isEqualTo("Karpagam College of Engineering");
        assertThat(roster.getInstitutionCode()).isEqualTo("KCE");
        assertThat(roster.getTotalStaffCount()).isEqualTo(4);
        assertThat(roster.getActiveCount()).isEqualTo(2);
        assertThat(roster.getPendingCount()).isEqualTo(2);
        assertThat(roster.getDepartmentHeadCount()).isEqualTo(2);
        assertThat(roster.getLabManagerCount()).isEqualTo(1);
        assertThat(roster.getTechnicianCount()).isEqualTo(1);

        assertThat(roster.getDepartments()).hasSize(2);

        DepartmentStaffGroupDto cseGroup = roster.getDepartments().stream()
                .filter(d -> d.getDepartmentId().equals(10L))
                .findFirst().orElseThrow();
        assertThat(cseGroup.getDepartmentName()).isEqualTo("Computer Science and Engineering");
        assertThat(cseGroup.getHeadCount()).isEqualTo(1);
        assertThat(cseGroup.getManagerCount()).isEqualTo(1);
        assertThat(cseGroup.getTechnicianCount()).isEqualTo(1);
        assertThat(cseGroup.getTotalStaffCount()).isEqualTo(3);
        assertThat(cseGroup.getStaff()).hasSize(3);

        DepartmentStaffGroupDto eceGroup = roster.getDepartments().stream()
                .filter(d -> d.getDepartmentId().equals(20L))
                .findFirst().orElseThrow();
        assertThat(eceGroup.getDepartmentName()).isEqualTo("Electronics and Communication Engineering");
        assertThat(eceGroup.getHeadCount()).isEqualTo(1);
        assertThat(eceGroup.getManagerCount()).isEqualTo(0);
        assertThat(eceGroup.getTechnicianCount()).isEqualTo(0);
        assertThat(eceGroup.getTotalStaffCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("getStaffDetails: successfully returns staff profile for same institution without secrets")
    void testGetStaffDetails_Success() {
        Role techRole = createRole(2L, "LAB_TECHNICIAN");
        AppUser staffUser = new AppUser();
        staffUser.setUserId(205L);
        staffUser.setInstitutionId(6L);
        staffUser.setDepartmentId(10L);
        staffUser.setFirstName("Sowmya");
        staffUser.setLastName("M");
        staffUser.setEmail("sowmya.tech@kce.ac.in");
        staffUser.setPhoneNumber("+919442188902");
        staffUser.setPasswordHash("SUPER_SECRET_HASH_DO_NOT_LEAK");
        staffUser.setIsActive(true);
        staffUser.setIsEmailVerified(true);
        staffUser.setIsPhoneVerified(true);
        staffUser.setRoles(Set.of(techRole));

        when(appUserRepository.findById(205L)).thenReturn(Optional.of(staffUser));
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(kceInstitution));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(cseDept));

        StaffMemberDto dto = userManagementService.getStaffDetails(kceAdmin, 205L);

        assertThat(dto).isNotNull();
        assertThat(dto.getUserId()).isEqualTo(205L);
        assertThat(dto.getFirstName()).isEqualTo("Sowmya");
        assertThat(dto.getLastName()).isEqualTo("M");
        assertThat(dto.getFullName()).isEqualTo("Sowmya M");
        assertThat(dto.getEmail()).isEqualTo("sowmya.tech@kce.ac.in");
        assertThat(dto.getRole()).isEqualTo("LAB_TECHNICIAN");
        assertThat(dto.getRoleLabel()).isEqualTo("Lab Technician");
        assertThat(dto.getStatus()).isEqualTo("ACTIVE");
        assertThat(dto.getInstitutionId()).isEqualTo(6L);
        assertThat(dto.getDepartmentId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getStaffDetails: IDOR test - throws 403 FORBIDDEN when accessing staff from foreign institution")
    void testGetStaffDetails_ForeignInstitution_Throws403() {
        AppUser psgStaffUser = new AppUser();
        psgStaffUser.setUserId(301L);
        psgStaffUser.setInstitutionId(7L); // Belongs to PSGTECH, not KCE
        psgStaffUser.setEmail("staff@psgtech.ac.in");

        when(appUserRepository.findById(301L)).thenReturn(Optional.of(psgStaffUser));

        assertThatThrownBy(() -> userManagementService.getStaffDetails(kceAdmin, 301L))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(apiEx.getMessage()).contains("You can only view staff within your own institution");
                });
    }

    @Test
    @DisplayName("getStaffDetails: throws 404 NOT_FOUND when user does not exist")
    void testGetStaffDetails_NotFound() {
        when(appUserRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userManagementService.getStaffDetails(kceAdmin, 999L))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }
}
