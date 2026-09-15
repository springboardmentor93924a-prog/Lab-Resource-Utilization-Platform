package com.labresource.backend.invitation.service;

import com.labresource.backend.auth.dto.UserSummaryDto;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.common.util.EmailService;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.invitation.dto.AcceptInvitationRequestDto;
import com.labresource.backend.invitation.dto.StaffInvitationRequestDto;
import com.labresource.backend.invitation.dto.StaffInvitationResponseDto;
import com.labresource.backend.invitation.entity.StaffInvitation;
import com.labresource.backend.invitation.repository.StaffInvitationRepository;
import com.labresource.backend.invitation.util.TokenSecurityUtil;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.role.repository.RoleRepository;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffInvitationServiceTest {

    @Mock
    private StaffInvitationRepository invitationRepository;
    @Mock
    private AppUserRepository userRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private StaffInvitationService invitationService;

    private UserPrincipal adminPrincipal;
    private Institution testInstitution;
    private Department testDepartment;
    private Role deptHeadRole;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(invitationService, "frontendUrl", "http://localhost:5173");

        AppUser adminUser = new AppUser();
        adminUser.setUserId(10L);
        adminUser.setInstitutionId(1L);
        adminUser.setEmail("admin@kce.ac.in");

        adminPrincipal = new UserPrincipal(adminUser);

        testInstitution = new Institution();
        testInstitution.setInstitutionId(1L);
        testInstitution.setName("Karpagam College of Engineering");

        testDepartment = new Department();
        testDepartment.setDepartmentId(101L);
        testDepartment.setInstitutionId(1L);
        testDepartment.setName("Computer Science and Engineering");

        deptHeadRole = new Role();
        deptHeadRole.setRoleId(2L);
        deptHeadRole.setRoleName("DEPARTMENT_HEAD");
    }

    @Test
    void testInviteStaff_Success() {
        StaffInvitationRequestDto request = new StaffInvitationRequestDto(
                "Dr. Ramesh Kumar", "ramesh@kce.ac.in", "9876543210", 101L, "DEPARTMENT_HEAD"
        );

        when(departmentRepository.findById(101L)).thenReturn(Optional.of(testDepartment));
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(testInstitution));
        when(userRepository.findByEmail("ramesh@kce.ac.in")).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber("9876543210")).thenReturn(Optional.empty());
        when(userRepository.findByDepartmentId(101L)).thenReturn(Collections.emptyList());
        when(invitationRepository.findByInstitutionIdAndDepartmentIdAndRoleNameAndStatusIn(anyLong(), anyLong(), anyString(), anyList()))
                .thenReturn(Collections.emptyList());
        lenient().when(invitationRepository.existsByEmailAndStatusIn(anyString(), anyList())).thenReturn(false);

        StaffInvitation savedInvitation = new StaffInvitation();
        savedInvitation.setInvitationId(1L);
        savedInvitation.setFullName("Dr. Ramesh Kumar");
        savedInvitation.setEmail("ramesh@kce.ac.in");
        savedInvitation.setPhoneNumber("9876543210");
        savedInvitation.setInstitutionId(1L);
        savedInvitation.setDepartmentId(101L);
        savedInvitation.setRoleName("DEPARTMENT_HEAD");
        savedInvitation.setStatus(StaffInvitation.STATUS_PENDING);
        savedInvitation.setExpiresAt(LocalDateTime.now().plusHours(24));

        when(invitationRepository.save(any(StaffInvitation.class))).thenReturn(savedInvitation);

        StaffInvitationResponseDto response = invitationService.inviteStaff(adminPrincipal, request);

        assertNotNull(response);
        assertEquals("Dr. Ramesh Kumar", response.getFullName());
        assertEquals("ramesh@kce.ac.in", response.getEmail());
        assertEquals("9876543210", response.getPhoneNumber());
        assertEquals("DEPARTMENT_HEAD", response.getRoleName());
        assertEquals("Karpagam College of Engineering", response.getInstitutionName());

        verify(emailService, times(1)).sendEmail(eq("ramesh@kce.ac.in"), anyString(), contains("http://localhost:5173/accept-invitation?token="));
    }

    @Test
    void testInviteStaff_InvalidRole() {
        StaffInvitationRequestDto request = new StaffInvitationRequestDto(
                "Ramesh", "ramesh@kce.ac.in", "9876543210", 101L, "INVALID_ROLE"
        );

        ApiException ex = assertThrows(ApiException.class, () -> invitationService.inviteStaff(adminPrincipal, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Invalid role"));
    }

    @Test
    void testInviteStaff_CrossInstitutionDepartment_Forbidden() {
        Department otherDept = new Department();
        otherDept.setDepartmentId(202L);
        otherDept.setInstitutionId(99L); // Different institution!

        StaffInvitationRequestDto request = new StaffInvitationRequestDto(
                "Ramesh", "ramesh@kce.ac.in", "9876543210", 202L, "DEPARTMENT_HEAD"
        );

        when(departmentRepository.findById(202L)).thenReturn(Optional.of(otherDept));

        ApiException ex = assertThrows(ApiException.class, () -> invitationService.inviteStaff(adminPrincipal, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("Department does not belong to your institution"));
    }

    @Test
    void testInviteStaff_DuplicateDepartmentHead_Conflict() {
        StaffInvitationRequestDto request = new StaffInvitationRequestDto(
                "Dr. Ramesh", "ramesh@kce.ac.in", "9876543210", 101L, "DEPARTMENT_HEAD"
        );

        when(departmentRepository.findById(101L)).thenReturn(Optional.of(testDepartment));
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(testInstitution));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber(anyString())).thenReturn(Optional.empty());

        // Simulate active Department Head user already present
        AppUser existingHead = new AppUser();
        existingHead.setUserId(50L);
        existingHead.setIsActive(true);
        existingHead.setRoles(Set.of(deptHeadRole));

        when(userRepository.findByDepartmentId(101L)).thenReturn(List.of(existingHead));

        ApiException ex = assertThrows(ApiException.class, () -> invitationService.inviteStaff(adminPrincipal, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertTrue(ex.getMessage().contains("already has an active DEPARTMENT_HEAD"));
    }

    @Test
    void testInviteStaff_MultipleTechnicians_Allowed() {
        StaffInvitationRequestDto request = new StaffInvitationRequestDto(
                "Tech Person 2", "tech2@kce.ac.in", "9876543211", 101L, "LAB_TECHNICIAN"
        );

        when(departmentRepository.findById(101L)).thenReturn(Optional.of(testDepartment));
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(testInstitution));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber(anyString())).thenReturn(Optional.empty());
        lenient().when(invitationRepository.existsByEmailAndStatusIn(anyString(), anyList())).thenReturn(false);

        StaffInvitation savedInv = new StaffInvitation();
        savedInv.setInvitationId(2L);
        savedInv.setFullName("Tech Person 2");
        savedInv.setEmail("tech2@kce.ac.in");
        savedInv.setPhoneNumber("9876543211");
        savedInv.setInstitutionId(1L);
        savedInv.setDepartmentId(101L);
        savedInv.setRoleName("LAB_TECHNICIAN");

        when(invitationRepository.save(any(StaffInvitation.class))).thenReturn(savedInv);

        StaffInvitationResponseDto response = invitationService.inviteStaff(adminPrincipal, request);
        assertNotNull(response);
        assertEquals("LAB_TECHNICIAN", response.getRoleName());
    }

    @Test
    void testValidateToken_Success() {
        String rawToken = "550e8400-e29b-41d4-a716-446655440000";
        String tokenHash = TokenSecurityUtil.hashToken(rawToken);

        StaffInvitation inv = new StaffInvitation();
        inv.setInvitationId(5L);
        inv.setFullName("Priya Kumar");
        inv.setEmail("priya@kce.ac.in");
        inv.setPhoneNumber("9876543210");
        inv.setInstitutionId(1L);
        inv.setDepartmentId(101L);
        inv.setRoleName("LAB_MANAGER");
        inv.setStatus(StaffInvitation.STATUS_PENDING);
        inv.setExpiresAt(LocalDateTime.now().plusHours(12));

        when(invitationRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(inv));
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(testInstitution));
        when(departmentRepository.findById(101L)).thenReturn(Optional.of(testDepartment));

        StaffInvitationResponseDto response = invitationService.validateToken(rawToken);
        assertNotNull(response);
        assertEquals("Priya Kumar", response.getFullName());
        assertEquals("LAB_MANAGER", response.getRoleName());
    }

    @Test
    void testAcceptInvitation_Success_CopiesPhoneNumber() {
        String rawToken = "abc-123-token";
        String tokenHash = TokenSecurityUtil.hashToken(rawToken);

        StaffInvitation inv = new StaffInvitation();
        inv.setInvitationId(10L);
        inv.setFullName("Dr. Suresh Babu");
        inv.setEmail("suresh@kce.ac.in");
        inv.setPhoneNumber("9876543999");
        inv.setInstitutionId(1L);
        inv.setDepartmentId(101L);
        inv.setRoleName("DEPARTMENT_HEAD");
        inv.setStatus(StaffInvitation.STATUS_PENDING);
        inv.setExpiresAt(LocalDateTime.now().plusHours(10));

        when(invitationRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(inv));
        when(userRepository.findByEmail("suresh@kce.ac.in")).thenReturn(Optional.empty());
        when(userRepository.findByDepartmentId(101L)).thenReturn(Collections.emptyList());
        when(roleRepository.findByRoleName("DEPARTMENT_HEAD")).thenReturn(Optional.of(deptHeadRole));
        when(passwordEncoder.encode("Password@123")).thenReturn("hashedPassword123");

        AppUser savedUser = new AppUser();
        savedUser.setUserId(88L);
        savedUser.setFirstName("Dr. Suresh");
        savedUser.setLastName("Babu");
        savedUser.setEmail("suresh@kce.ac.in");
        savedUser.setPhoneNumber("9876543999");
        savedUser.setInstitutionId(1L);
        savedUser.setDepartmentId(101L);
        savedUser.setIsActive(true);
        savedUser.setRoles(Set.of(deptHeadRole));

        when(userRepository.save(any(AppUser.class))).thenReturn(savedUser);
        when(departmentRepository.findById(101L)).thenReturn(Optional.of(testDepartment));

        AcceptInvitationRequestDto acceptReq = new AcceptInvitationRequestDto(rawToken, "Password@123", "Password@123");
        UserSummaryDto userDto = invitationService.acceptInvitation(acceptReq);

        assertNotNull(userDto);
        assertEquals("suresh@kce.ac.in", userDto.getEmail());
        assertEquals("9876543999", userDto.getPhoneNumber()); // VERIFIED PHONE NUMBER COPIED

        ArgumentCaptor<StaffInvitation> invCaptor = ArgumentCaptor.forClass(StaffInvitation.class);
        verify(invitationRepository).save(invCaptor.capture());
        assertEquals(StaffInvitation.STATUS_ACCEPTED, invCaptor.getValue().getStatus());
        assertNotNull(invCaptor.getValue().getAcceptedAt());
    }

    @Test
    void testAcceptInvitation_PasswordMismatch_BadRequest() {
        AcceptInvitationRequestDto acceptReq = new AcceptInvitationRequestDto("some-token", "Pass1", "Pass2");
        ApiException ex = assertThrows(ApiException.class, () -> invitationService.acceptInvitation(acceptReq));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Passwords do not match"));
    }
}
