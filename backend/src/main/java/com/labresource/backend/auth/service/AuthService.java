package com.labresource.backend.auth.service;

import com.labresource.backend.auth.dto.AuthResponse;
import com.labresource.backend.auth.dto.LoginRequest;
import com.labresource.backend.auth.dto.RegisterRequest;
import com.labresource.backend.auth.dto.UserSummaryDto;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.role.repository.RoleRepository;
import com.labresource.backend.security.JwtTokenProvider;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.labresource.backend.auth.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.labresource.backend.otp.repository.OtpVerificationRepository otpVerificationRepository;
    private final com.labresource.backend.session.service.SessionService sessionService;
    private final com.labresource.backend.notification.service.NotificationService notificationService;

    @Transactional
    public UserSummaryDto register(RegisterRequest request) {
        String normalizedEmail = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        if (normalizedEmail.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required.");
        }

        if (appUserRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        // Validate institution exists, is approved, and is active
        com.labresource.backend.institution.entity.Institution inst = institutionRepository.findById(request.getInstitutionId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected institution does not exist."));
        if (!"APPROVED".equalsIgnoreCase(inst.getApprovalStatus()) || !Boolean.TRUE.equals(inst.getIsActive())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The selected institution is not active or has not been approved.");
        }

        // Validate department exists, belongs to chosen institution, and is active
        com.labresource.backend.department.entity.Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected department does not exist."));
        if (!request.getInstitutionId().equals(dept.getInstitutionId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected department does not belong to the chosen institution.");
        }
        if (!Boolean.TRUE.equals(dept.getIsActive())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected department is currently inactive.");
        }

        // Verify OTP was successfully completed within the last 15 minutes
        otpVerificationRepository.findFirstByIdentifierAndPurposeAndVerifiedAtNotNullOrderByVerifiedAtDesc(
                normalizedEmail, "REGISTRATION")
                .filter(otp -> otp.getVerifiedAt().isAfter(java.time.LocalDateTime.now().minusMinutes(15)))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Email OTP verification is required prior to registration."));

        String requestedRole = request.getRole() != null ? request.getRole().trim().toUpperCase() : "STUDENT";
        if (!"STUDENT".equals(requestedRole) && !"RESEARCHER".equals(requestedRole) && !Role.RESEARCHER.equals(requestedRole)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid registration role. Only STUDENT or RESEARCHER registrations are allowed.");
        }

        // Academic detail validations
        String rollNumber = null;
        String researcherId = null;
        if ("STUDENT".equals(requestedRole)) {
            if (request.getRollNumber() == null || request.getRollNumber().trim().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Roll number is required for student registration.");
            }
            rollNumber = request.getRollNumber().trim();
        } else {
            if (request.getResearcherId() == null || request.getResearcherId().trim().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Researcher ID is required for researcher registration.");
            }
            researcherId = request.getResearcherId().trim();
        }

        Role assignedRole = roleRepository.findByRoleName(Role.RESEARCHER)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "RESEARCHER role is not configured."));

        AppUser user = new AppUser();
        user.setFirstName(request.getFirstName() != null ? request.getFirstName().trim() : "");
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : "");
        user.setEmail(normalizedEmail);
        user.setPasswordHash(null);
        user.setAuthProvider("LOCAL");
        user.setPhoneNumber(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setInstitutionId(request.getInstitutionId());
        user.setDepartmentId(request.getDepartmentId());
        user.setRollNumber(rollNumber);
        user.setResearcherId(researcherId);
        
        // Application state: Email is verified via OTP, but account is pending approval & password setup
        user.setIsActive(false); 
        user.setIsEmailVerified(true);
        user.setRoles(new HashSet<>() {{ add(assignedRole); }});

        AppUser saved = appUserRepository.save(user);

        // Notify institution admins for approval
        notificationService.notifyInstitutionAdmins(
                saved.getInstitutionId(),
                "STUDENT_REGISTRATION",
                "New " + requestedRole + " Registration",
                "A " + requestedRole.toLowerCase() + " registered for email: " + saved.getEmail() + ". Approval is required."
        );

        return UserSummaryDto.fromEntity(saved);
    }

    public java.util.Map<String, Object> validateSetupToken(String token) {
        String tokenHash = com.labresource.backend.security.TokenHashUtil.hashToken(token);
        com.labresource.backend.auth.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid setup token."));

        if (Boolean.TRUE.equals(resetToken.getIsUsed())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This setup link has already been used.");
        }

        if (resetToken.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This setup link has expired.");
        }

        AppUser user = appUserRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        String instName = user.getInstitutionId() != null
                ? institutionRepository.findById(user.getInstitutionId()).map(com.labresource.backend.institution.entity.Institution::getName).orElse(null)
                : null;

        String roleName = user.getRoles().stream().findFirst().map(Role::getRoleName).orElse("USER");

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("valid", true);
        resp.put("email", user.getEmail());
        resp.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
        resp.put("lastName", user.getLastName() != null ? user.getLastName() : "");
        resp.put("userId", user.getUserId());
        resp.put("institutionId", user.getInstitutionId());
        resp.put("institutionName", instName != null ? instName : "");
        resp.put("roleName", roleName);
        return resp;
    }

    @Transactional
    public java.util.Map<String, Object> setupPassword(com.labresource.backend.auth.dto.SetupPasswordRequestDto request) {
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long.");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }

        String tokenHash = com.labresource.backend.security.TokenHashUtil.hashToken(request.getToken());
        com.labresource.backend.auth.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid setup token."));

        if (Boolean.TRUE.equals(resetToken.getIsUsed())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This setup link has already been used.");
        }

        if (resetToken.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This setup link has expired.");
        }

        AppUser user = appUserRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        // Enforce ONE active Institution Admin per institution
        boolean isInstAdmin = user.getRoles().stream().anyMatch(r -> Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (isInstAdmin && user.getInstitutionId() != null) {
            List<AppUser> activeAdmins = appUserRepository.findByRoleNameAndInstitutionId(Role.INSTITUTION_ADMIN, user.getInstitutionId())
                    .stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsActive()) && !a.getUserId().equals(user.getUserId()))
                    .toList();
            if (!activeAdmins.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT, "This institution already has an active Institution Administrator.");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setIsEmailVerified(true);
        appUserRepository.save(user);

        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return java.util.Map.of(
                "message", "Password setup successful. Your account is now activated. You can now log in.",
                "email", user.getEmail()
        );
    }

    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (user.getPasswordHash() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Account setup is incomplete. Please complete password setup using your account setup link."
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            String msg = "This account has been deactivated.";
            if (user.getDeactivationReason() != null && !user.getDeactivationReason().isBlank()) {
                msg += " Reason: " + user.getDeactivationReason();
            }
            throw new ApiException(HttpStatus.FORBIDDEN, msg);
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtTokenProvider.generateToken(principal);

        // Record session and generate refresh token
        sessionService.createSession(user.getUserId(), ipAddress, userAgent);
        String refreshToken = sessionService.createRefreshToken(user.getUserId());

        UserSummaryDto userSummary = enrichUserSummary(user);
        AuthResponse response = new AuthResponse(token, userSummary);
        response.setRefreshToken(refreshToken);
        return response;
    }

    @Transactional
    public void logout(Long userId) {
        sessionService.logout(userId);
    }

    public UserSummaryDto currentUser(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
        return enrichUserSummary(user);
    }

    private UserSummaryDto enrichUserSummary(AppUser user) {
        UserSummaryDto dto = UserSummaryDto.fromEntity(user);
        if (user.getInstitutionId() != null) {
            institutionRepository.findById(user.getInstitutionId()).ifPresent(inst -> {
                dto.setInstitutionName(inst.getName());
                dto.setInstitutionCode(inst.getCode());
            });
        }
        if (user.getDepartmentId() != null) {
            departmentRepository.findById(user.getDepartmentId()).ifPresent(dept -> {
                dto.setDepartmentName(dept.getName());
                dto.setDepartmentCode(dept.getCode());
            });
        }
        return dto;
    }
}
