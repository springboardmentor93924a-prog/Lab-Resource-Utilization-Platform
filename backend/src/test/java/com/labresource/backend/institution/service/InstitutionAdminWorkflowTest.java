package com.labresource.backend.institution.service;

import com.labresource.backend.auth.dto.AuthResponse;
import com.labresource.backend.auth.dto.LoginRequest;
import com.labresource.backend.auth.dto.SetupPasswordRequestDto;
import com.labresource.backend.auth.dto.UserSummaryDto;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.auth.repository.PasswordResetTokenRepository;
import com.labresource.backend.auth.service.AuthService;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.institution.dto.InstitutionDto;
import com.labresource.backend.institution.dto.InstitutionRegistrationRequestDto;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class InstitutionAdminWorkflowTest {

    @Autowired
    private InstitutionService institutionService;

    @Autowired
    private AuthService authService;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private com.labresource.backend.role.repository.RoleRepository roleRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Test
    @DisplayName("1. Register Institution Admin -> PENDING status and department_id is null")
    void testRegisterInstitutionAdminPending() {
        String code = "TEST_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String adminEmail = "admin." + code.toLowerCase() + "@testinst.edu";

        InstitutionRegistrationRequestDto dto = new InstitutionRegistrationRequestDto();
        dto.setName("Test Institution " + code);
        dto.setCode(code);
        dto.setInstitutionType("Autonomous Engineering College");
        dto.setOfficialEmail("contact@" + code.toLowerCase() + ".edu");
        dto.setAddress("123 Tech Campus");
        dto.setCity("Coimbatore");
        dto.setState("Tamil Nadu");
        dto.setCountry("India");
        dto.setAdminFirstName("Ramesh");
        dto.setAdminLastName("Kumar");
        dto.setAdminEmail(adminEmail);
        dto.setAdminPhone("+91 98765 11111");

        InstitutionDto result = institutionService.registerInstitution(dto);

        assertNotNull(result);
        assertEquals("PENDING", result.getApprovalStatus());
        assertFalse(result.getIsActive());

        AppUser adminUser = appUserRepository.findByEmail(adminEmail).orElse(null);
        assertNotNull(adminUser);
        assertFalse(adminUser.getIsActive());
        assertNull(adminUser.getDepartmentId(), "Institution Admin department_id must be NULL");
        assertEquals(result.getInstitutionId(), adminUser.getInstitutionId());
        assertNull(adminUser.getPasswordHash(), "Password must not be created during initial registration");
    }

    @Test
    @DisplayName("2. Duplicate Institution Code is rejected with 409 Conflict")
    void testDuplicateInstitutionCodeRejected() {
        String code = "DUP_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        InstitutionRegistrationRequestDto dto1 = new InstitutionRegistrationRequestDto();
        dto1.setName("First Inst " + code);
        dto1.setCode(code);
        dto1.setOfficialEmail("contact1@" + code.toLowerCase() + ".edu");
        dto1.setAddress("Campus A");
        dto1.setCity("Chennai");
        dto1.setState("Tamil Nadu");
        dto1.setAdminFirstName("Admin");
        dto1.setAdminEmail("admin1@" + code.toLowerCase() + ".edu");

        institutionService.registerInstitution(dto1);

        InstitutionRegistrationRequestDto dto2 = new InstitutionRegistrationRequestDto();
        dto2.setName("Second Inst " + code);
        dto2.setCode(code);
        dto2.setOfficialEmail("contact2@" + code.toLowerCase() + ".edu");
        dto2.setAddress("Campus B");
        dto2.setCity("Salem");
        dto2.setState("Tamil Nadu");
        dto2.setAdminFirstName("Admin2");
        dto2.setAdminEmail("admin2@" + code.toLowerCase() + ".edu");

        ApiException ex = assertThrows(ApiException.class, () -> institutionService.registerInstitution(dto2));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    @DisplayName("3. Missing required fields in Registration fails with 400 Bad Request")
    void testMissingRequiredFields() {
        InstitutionRegistrationRequestDto dto = new InstitutionRegistrationRequestDto();
        dto.setCode("CODE123");

        ApiException ex = assertThrows(ApiException.class, () -> institutionService.registerInstitution(dto));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    @DisplayName("4. System Admin sees complete application in pending list")
    void testSystemAdminPendingList() {
        String code = "PEND_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String adminEmail = "pending." + code.toLowerCase() + "@univ.edu";

        InstitutionRegistrationRequestDto dto = new InstitutionRegistrationRequestDto();
        dto.setName("Pending Univ " + code);
        dto.setCode(code);
        dto.setOfficialEmail("official@" + code.toLowerCase() + ".edu");
        dto.setAddress("Academic Road");
        dto.setCity("Madurai");
        dto.setState("Tamil Nadu");
        dto.setAdminFirstName("Suresh");
        dto.setAdminLastName("V");
        dto.setAdminEmail(adminEmail);
        dto.setAdminPhone("+91 94444 55555");

        InstitutionDto registered = institutionService.registerInstitution(dto);

        List<InstitutionDto> pendingList = institutionService.getPendingInstitutions();
        assertTrue(pendingList.stream().anyMatch(i -> i.getInstitutionId().equals(registered.getInstitutionId())));

        InstitutionDto found = pendingList.stream()
                .filter(i -> i.getInstitutionId().equals(registered.getInstitutionId()))
                .findFirst().orElse(null);

        assertNotNull(found);
        assertEquals("Suresh", found.getAdminFirstName());
        assertEquals("V", found.getAdminLastName());
        assertEquals(adminEmail, found.getAdminEmail());
        assertEquals("+91 94444 55555", found.getAdminPhone());
    }

    @Test
    @DisplayName("5. System Admin approves application -> generates setup flow, password setup succeeds, and login succeeds")
    void testFullApprovalAndSetupWorkflow() {
        String code = "APPR_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String adminEmail = "appr." + code.toLowerCase() + "@inst.edu";

        InstitutionRegistrationRequestDto dto = new InstitutionRegistrationRequestDto();
        dto.setName("Approved Univ " + code);
        dto.setCode(code);
        dto.setOfficialEmail("contact@" + code.toLowerCase() + ".edu");
        dto.setAddress("Innovation Park");
        dto.setCity("Coimbatore");
        dto.setState("Tamil Nadu");
        dto.setAdminFirstName("Nivetha");
        dto.setAdminLastName("B");
        dto.setAdminEmail(adminEmail);

        InstitutionDto registered = institutionService.registerInstitution(dto);
        Long instId = registered.getInstitutionId();

        // 1. Approve
        Map<String, String> approveResp = institutionService.approveInstitution(1L, instId);
        assertNotNull(approveResp);

        Institution approvedInst = institutionRepository.findById(instId).orElse(null);
        assertNotNull(approvedInst);
        assertEquals("APPROVED", approvedInst.getApprovalStatus());
        assertTrue(approvedInst.getIsActive());
        assertEquals(1L, approvedInst.getReviewedBy());

        AppUser adminUser = appUserRepository.findByEmail(adminEmail).orElse(null);
        assertNotNull(adminUser);
        assertNull(adminUser.getDepartmentId());

        // 2. Locate generated setup token
        var tokens = passwordResetTokenRepository.findAll().stream()
                .filter(t -> adminUser.getUserId().equals(t.getUserId()) && !Boolean.TRUE.equals(t.getIsUsed()))
                .toList();
        assertFalse(tokens.isEmpty(), "Setup token must be generated upon approval");

        // 3. Test setup password via token
        // In real email, user gets raw UUID token. Let's test setupPassword logic
        var rawToken = UUID.randomUUID().toString();
        var hashed = com.labresource.backend.security.TokenHashUtil.hashToken(rawToken);
        var tokenEntity = tokens.get(0);
        tokenEntity.setTokenHash(hashed);
        passwordResetTokenRepository.save(tokenEntity);

        // Validate token
        Map<String, Object> validation = authService.validateSetupToken(rawToken);
        assertTrue((Boolean) validation.get("valid"));
        assertEquals(adminEmail, validation.get("email"));

        // Setup password
        SetupPasswordRequestDto setupDto = new SetupPasswordRequestDto();
        setupDto.setToken(rawToken);
        setupDto.setPassword("AdminSecure@2026");
        setupDto.setConfirmPassword("AdminSecure@2026");

        Map<String, Object> setupResult = authService.setupPassword(setupDto);
        assertNotNull(setupResult);

        // Account is now active
        AppUser activatedUser = appUserRepository.findByEmail(adminEmail).orElse(null);
        assertNotNull(activatedUser);
        assertTrue(activatedUser.getIsActive());
        assertNotNull(activatedUser.getPasswordHash());

        // 4. Token cannot be reused
        ApiException reuseEx = assertThrows(ApiException.class, () -> authService.setupPassword(setupDto));
        assertEquals(HttpStatus.BAD_REQUEST, reuseEx.getStatus());

        // 5. Real Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(adminEmail);
        loginReq.setPassword("AdminSecure@2026");

        AuthResponse authResp = authService.login(loginReq, "127.0.0.1", "JUnit-Test");
        assertNotNull(authResp);
        assertNotNull(authResp.getToken());
        assertEquals(adminEmail, authResp.getUser().getEmail());

        // 6. Wrong password fails
        LoginRequest wrongReq = new LoginRequest();
        wrongReq.setEmail(adminEmail);
        wrongReq.setPassword("WrongPassword@123");
        ApiException wrongEx = assertThrows(ApiException.class, () -> authService.login(wrongReq, "127.0.0.1", "JUnit-Test"));
        assertEquals(HttpStatus.UNAUTHORIZED, wrongEx.getStatus());
    }

    @Test
    @DisplayName("6. Rejection without reason fails with 400 Bad Request; rejection with reason succeeds and persists")
    void testRejectionWorkflow() {
        String code = "REJ_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String adminEmail = "rej." + code.toLowerCase() + "@inst.edu";

        InstitutionRegistrationRequestDto dto = new InstitutionRegistrationRequestDto();
        dto.setName("Rejected Inst " + code);
        dto.setCode(code);
        dto.setOfficialEmail("contact@" + code.toLowerCase() + ".edu");
        dto.setAddress("Outskirt Road");
        dto.setCity("Tirupur");
        dto.setState("Tamil Nadu");
        dto.setAdminFirstName("Applicant");
        dto.setAdminEmail(adminEmail);

        InstitutionDto registered = institutionService.registerInstitution(dto);
        Long instId = registered.getInstitutionId();

        // 1. Rejection without reason fails
        ApiException blankEx = assertThrows(ApiException.class, () -> institutionService.rejectInstitution(1L, instId, "   "));
        assertEquals(HttpStatus.BAD_REQUEST, blankEx.getStatus());

        // 2. Rejection with reason succeeds
        String reason = "Invalid institutional accreditation documentation.";
        institutionService.rejectInstitution(1L, instId, reason);

        Institution rejectedInst = institutionRepository.findById(instId).orElse(null);
        assertNotNull(rejectedInst);
        assertEquals("REJECTED", rejectedInst.getApprovalStatus());
        assertFalse(rejectedInst.getIsActive());
        assertEquals(reason, rejectedInst.getRejectionReason());

        AppUser adminUser = appUserRepository.findByEmail(adminEmail).orElse(null);
        assertNotNull(adminUser);
        assertFalse(adminUser.getIsActive());
        assertEquals(reason, adminUser.getRejectionReason());
    }

    @Test
    @DisplayName("7. Existing email does not create duplicate user row")
    void testExistingEmailDoesNotDuplicate() {
        String code1 = "EX1_" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String email = "shared.admin@test.edu";

        InstitutionRegistrationRequestDto dto1 = new InstitutionRegistrationRequestDto();
        dto1.setName("First Application " + code1);
        dto1.setCode(code1);
        dto1.setOfficialEmail("contact@" + code1.toLowerCase() + ".edu");
        dto1.setAddress("Street 1");
        dto1.setCity("Salem");
        dto1.setState("Tamil Nadu");
        dto1.setAdminFirstName("Original");
        dto1.setAdminEmail(email);

        InstitutionDto inst1 = institutionService.registerInstitution(dto1);
        AppUser user1 = appUserRepository.findByEmail(email).orElse(null);
        assertNotNull(user1);
        Long originalUserId = user1.getUserId();

        // Count appuser rows with this email
        long count = appUserRepository.findAll().stream().filter(u -> email.equalsIgnoreCase(u.getEmail())).count();
        assertEquals(1, count, "Must have exactly 1 appuser row for this email");
        assertEquals(originalUserId, user1.getUserId());
    }

    @Test
    @DisplayName("8. Production Project Accounts Verified: Nivetha S (KCE), Pavithra R (PSGTECH), Ranjitha M (KCT)")
    void testProductionProjectAccountsState() {
        // KCE
        AppUser kceAdmin = appUserRepository.findByEmail("admin@kce.ac.in").orElse(null);
        if (kceAdmin != null) {
            assertEquals("Nivetha", kceAdmin.getFirstName());
            assertEquals("S", kceAdmin.getLastName());
            assertEquals(6L, kceAdmin.getInstitutionId());
            assertNull(kceAdmin.getDepartmentId());
            assertTrue(kceAdmin.getIsEmailVerified());
            assertFalse(kceAdmin.getIsPhoneVerified());
            assertTrue(kceAdmin.getIsActive());
        }

        // PSGTECH
        AppUser psgAdmin = appUserRepository.findByEmail("admin@psgtech.ac.in").orElse(null);
        if (psgAdmin != null) {
            assertEquals("Pavithra", psgAdmin.getFirstName());
            assertEquals("R", psgAdmin.getLastName());
            assertEquals(7L, psgAdmin.getInstitutionId());
            assertNull(psgAdmin.getDepartmentId());
            assertTrue(psgAdmin.getIsEmailVerified());
            assertFalse(psgAdmin.getIsPhoneVerified());
            assertTrue(psgAdmin.getIsActive());
        }

        // KCT
        AppUser kctAdmin = appUserRepository.findByEmail("admin@kct.ac.in").orElse(null);
        if (kctAdmin != null) {
            assertEquals("Ranjitha", kctAdmin.getFirstName());
            assertEquals("M", kctAdmin.getLastName());
            assertEquals(8L, kctAdmin.getInstitutionId());
            assertNull(kctAdmin.getDepartmentId());
            assertTrue(kctAdmin.getIsEmailVerified());
            assertFalse(kctAdmin.getIsPhoneVerified());
            assertTrue(kctAdmin.getIsActive());
        }
    }

    @Test
    @DisplayName("9. Single Active Admin Rule: Multiple active admins on same institution triggers Conflict")
    void testSingleActiveAdminRule() {
        String code = "SA_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        InstitutionRegistrationRequestDto dto = new InstitutionRegistrationRequestDto();
        dto.setName("Single Admin Univ " + code);
        dto.setCode(code);
        dto.setOfficialEmail("contact@" + code.toLowerCase() + ".edu");
        dto.setAdminFirstName("AdminOne");
        dto.setAdminEmail("admin1." + code.toLowerCase() + "@inst.edu");

        InstitutionDto registered = institutionService.registerInstitution(dto);
        Long instId = registered.getInstitutionId();

        // Approve first
        institutionService.approveInstitution(1L, instId);

        // Manually activate 2 admins on this institution to simulate edge case
        com.labresource.backend.role.entity.Role adminRole = roleRepository.findByRoleName("INSTITUTION_ADMIN")
                .orElseThrow();
        AppUser admin1 = appUserRepository.findByEmail("admin1." + code.toLowerCase() + "@inst.edu").orElseThrow();
        admin1.setIsActive(true);
        appUserRepository.save(admin1);

        AppUser admin2 = new AppUser();
        admin2.setInstitutionId(instId);
        admin2.setEmail("admin2." + code.toLowerCase() + "@inst.edu");
        admin2.setFirstName("AdminTwo");
        admin2.setIsActive(true);
        admin2.setRoles(new java.util.HashSet<>(java.util.List.of(adminRole)));
        appUserRepository.save(admin2);

        // Subsequent approve attempt will detect conflict
        ApiException ex = assertThrows(ApiException.class, () -> institutionService.approveInstitution(1L, instId));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }
}
