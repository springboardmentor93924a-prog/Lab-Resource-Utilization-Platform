package com.labresource.backend.systemadmin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.labresource.backend.audit.repository.AuditLogRepository;
import com.labresource.backend.auth.dto.LoginRequest;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.auth.service.AuthService;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.otp.repository.OtpVerificationRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.role.repository.RoleRepository;
import com.labresource.backend.security.JwtTokenProvider;
import com.labresource.backend.session.service.SessionService;
import com.labresource.backend.settings.dto.SystemSettingsDto;
import com.labresource.backend.settings.entity.SystemSettings;
import com.labresource.backend.settings.repository.SystemSettingsRepository;
import com.labresource.backend.settings.service.SystemSettingsService;
import com.labresource.backend.systemadmin.dto.PlatformAnalyticsDto;
import com.labresource.backend.systemadmin.service.SystemAdminAnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemAdminPhase3Test {

    @Mock
    private SystemSettingsRepository settingsRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private LaboratoryRepository laboratoryRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private com.labresource.backend.auth.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private OtpVerificationRepository otpVerificationRepository;

    @Mock
    private SessionService sessionService;

    @Mock
    private NotificationService notificationService;

    private SystemSettingsService settingsService;
    private SystemAdminAnalyticsService analyticsService;
    private AuthService authService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        settingsService = new SystemSettingsService(settingsRepository, auditLogRepository, objectMapper);
        analyticsService = new SystemAdminAnalyticsService(
                institutionRepository, appUserRepository, laboratoryRepository, equipmentRepository, bookingRepository, auditLogRepository
        );
        authService = new AuthService(
                appUserRepository,
                institutionRepository,
                departmentRepository,
                roleRepository,
                passwordEncoder,
                jwtTokenProvider,
                passwordResetTokenRepository,
                otpVerificationRepository,
                sessionService,
                notificationService,
                settingsService
        );
    }

    @Test
    @DisplayName("Should return default system settings when entity does not exist in DB")
    void testGetSettingsDefaults() {
        when(settingsRepository.findById(1L)).thenReturn(Optional.empty());

        SystemSettingsDto settings = settingsService.getSettings();
        assertNotNull(settings);
        assertTrue(settings.getInstitutionRegistrationEnabled());
        assertTrue(settings.getResearcherRegistrationEnabled());
        assertFalse(settings.getMaintenanceMode());
    }

    @Test
    @DisplayName("Should update system settings and save audit log")
    void testUpdateSettings() {
        SystemSettings existing = new SystemSettings();
        existing.setSettingsId(1L);
        existing.setInstitutionRegistrationEnabled(true);
        existing.setResearcherRegistrationEnabled(true);
        existing.setMaintenanceMode(false);

        when(settingsRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(settingsRepository.save(any(SystemSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SystemSettingsDto updateDto = new SystemSettingsDto(false, true, true, null, null);
        SystemSettingsDto result = settingsService.updateSettings(updateDto, 99L);

        assertNotNull(result);
        assertFalse(result.getInstitutionRegistrationEnabled());
        assertTrue(result.getResearcherRegistrationEnabled());
        assertTrue(result.getMaintenanceMode());
        assertEquals(99L, result.getUpdatedBy());

        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should compute platform analytics aggregation cleanly")
    void testPlatformAnalyticsAggregation() {
        when(institutionRepository.findAll()).thenReturn(Collections.emptyList());
        when(appUserRepository.findAll()).thenReturn(Collections.emptyList());
        when(laboratoryRepository.findAll()).thenReturn(Collections.emptyList());
        when(equipmentRepository.findAll()).thenReturn(Collections.emptyList());
        when(bookingRepository.findAll()).thenReturn(Collections.emptyList());
        when(auditLogRepository.findAll()).thenReturn(Collections.emptyList());

        PlatformAnalyticsDto analytics = analyticsService.getPlatformAnalytics();
        assertNotNull(analytics);
        assertNotNull(analytics.getInstitutions());
        assertEquals(0, analytics.getInstitutions().getTotal());
        assertNotNull(analytics.getUsers());
        assertEquals(0, analytics.getUsers().getTotal());
        assertNotNull(analytics.getLaboratories());
        assertEquals(0, analytics.getLaboratories().getTotal());
        assertNotNull(analytics.getEquipment());
        assertEquals(0, analytics.getEquipment().getTotal());
        assertNotNull(analytics.getBookings());
        assertEquals(0, analytics.getBookings().getTotal());
        assertNotNull(analytics.getActivity());
        assertEquals(0, analytics.getActivity().getTotalAuditLogs());
    }

    @Test
    @DisplayName("Maintenance Mode ON + Non-System-Admin -> Throws HTTP 503 Service Unavailable")
    void testMaintenanceModeActiveBlocksNonSysAdminWith503() {
        // Maintenance mode ON
        SystemSettings maintenanceSettings = new SystemSettings();
        maintenanceSettings.setSettingsId(1L);
        maintenanceSettings.setMaintenanceMode(true);
        when(settingsRepository.findById(1L)).thenReturn(Optional.of(maintenanceSettings));

        // Non-System-Admin user (Researcher)
        AppUser researcher = new AppUser();
        researcher.setUserId(10L);
        researcher.setEmail("researcher@lab.com");
        researcher.setPasswordHash("hashed_password");
        researcher.setIsActive(true);
        Role researcherRole = new Role();
        researcherRole.setRoleName("RESEARCHER");
        researcher.setRoles(Set.of(researcherRole));

        when(appUserRepository.findByEmail("researcher@lab.com")).thenReturn(Optional.of(researcher));
        when(passwordEncoder.matches("secret123", "hashed_password")).thenReturn(true);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("researcher@lab.com");
        loginReq.setPassword("secret123");

        ApiException ex = assertThrows(ApiException.class, () ->
                authService.login(loginReq, "127.0.0.1", "JUnit-Test")
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatus());
        assertEquals(503, ex.getStatus().value());
        assertTrue(ex.getMessage().contains("Platform is currently under scheduled maintenance"));
    }

    @Test
    @DisplayName("Maintenance Mode ON + System Admin -> Login Allowed")
    void testMaintenanceModeActiveAllowsSystemAdmin() {
        // Maintenance mode ON
        SystemSettings maintenanceSettings = new SystemSettings();
        maintenanceSettings.setSettingsId(1L);
        maintenanceSettings.setMaintenanceMode(true);
        when(settingsRepository.findById(1L)).thenReturn(Optional.of(maintenanceSettings));

        // System Admin user
        AppUser sysAdmin = new AppUser();
        sysAdmin.setUserId(1L);
        sysAdmin.setEmail("admin@lab.com");
        sysAdmin.setPasswordHash("hashed_password");
        sysAdmin.setIsActive(true);
        Role adminRole = new Role();
        adminRole.setRoleName("SYSTEM_ADMIN");
        sysAdmin.setRoles(Set.of(adminRole));

        when(appUserRepository.findByEmail("admin@lab.com")).thenReturn(Optional.of(sysAdmin));
        when(passwordEncoder.matches("admin123", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any())).thenReturn("mock_token");

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("admin@lab.com");
        loginReq.setPassword("admin123");

        assertDoesNotThrow(() -> authService.login(loginReq, "127.0.0.1", "JUnit-Test"));
    }

    @Test
    @DisplayName("Maintenance Mode OFF -> All users allowed")
    void testMaintenanceModeDisabledAllowsNormalLogin() {
        // Maintenance mode OFF
        SystemSettings normalSettings = new SystemSettings();
        normalSettings.setSettingsId(1L);
        normalSettings.setMaintenanceMode(false);
        when(settingsRepository.findById(1L)).thenReturn(Optional.of(normalSettings));

        // Researcher user
        AppUser researcher = new AppUser();
        researcher.setUserId(10L);
        researcher.setEmail("researcher@lab.com");
        researcher.setPasswordHash("hashed_password");
        researcher.setIsActive(true);
        Role researcherRole = new Role();
        researcherRole.setRoleName("RESEARCHER");
        researcher.setRoles(Set.of(researcherRole));

        when(appUserRepository.findByEmail("researcher@lab.com")).thenReturn(Optional.of(researcher));
        when(passwordEncoder.matches("secret123", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any())).thenReturn("mock_token");

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("researcher@lab.com");
        loginReq.setPassword("secret123");

        assertDoesNotThrow(() -> authService.login(loginReq, "127.0.0.1", "JUnit-Test"));
    }
}
