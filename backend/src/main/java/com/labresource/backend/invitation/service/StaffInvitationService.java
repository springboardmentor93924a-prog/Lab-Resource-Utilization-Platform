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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffInvitationService {

    private final StaffInvitationRepository invitationRepository;
    private final AppUserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private static final Set<String> ALLOWED_ROLES = Set.of("DEPARTMENT_HEAD", "LAB_MANAGER", "LAB_TECHNICIAN");

    @Transactional
    public StaffInvitationResponseDto inviteStaff(UserPrincipal admin, StaffInvitationRequestDto dto) {
        Long adminInstId = admin.getInstitutionId();
        if (adminInstId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution Admin must belong to an institution.");
        }

        // Validate Role
        String roleName = dto.getRoleName().toUpperCase();
        if (!ALLOWED_ROLES.contains(roleName)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role. Allowed roles: DEPARTMENT_HEAD, LAB_MANAGER, LAB_TECHNICIAN.");
        }

        // Validate Department ownership
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
        if (!adminInstId.equals(dept.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Department does not belong to your institution.");
        }

        Institution inst = institutionRepository.findById(adminInstId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));

        String cleanEmail = dto.getEmail().toLowerCase().trim();
        String cleanPhone = dto.getPhoneNumber().trim();

        // 1. Prevent duplicate active user email or phone
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "User with email " + cleanEmail + " already exists.");
        }
        if (userRepository.findByPhoneNumber(cleanPhone).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "User with phone number " + cleanPhone + " already exists.");
        }

        // 2. Role Uniqueness Rule: Exactly 1 active Department Head & 1 Lab Manager per department
        if ("DEPARTMENT_HEAD".equals(roleName) || "LAB_MANAGER".equals(roleName)) {
            // Check if active user already exists with this role in this department
            List<AppUser> activeUsers = userRepository.findByDepartmentId(dept.getDepartmentId());
            boolean hasActiveRoleUser = activeUsers.stream()
                    .anyMatch(u -> Boolean.TRUE.equals(u.getIsActive()) && u.getRoles().stream().anyMatch(r -> roleName.equalsIgnoreCase(r.getRoleName())));

            if (hasActiveRoleUser) {
                throw new ApiException(HttpStatus.CONFLICT, "Department " + dept.getName() + " already has an active " + roleName + ".");
            }

            // Check if pending invitation exists for a DIFFERENT email for this unique role in this department
            List<StaffInvitation> pendingRoleInvs = invitationRepository
                    .findByInstitutionIdAndDepartmentIdAndRoleNameAndStatusIn(adminInstId, dept.getDepartmentId(), roleName, List.of(StaffInvitation.STATUS_PENDING));
            boolean pendingDiffEmail = pendingRoleInvs.stream().anyMatch(inv -> !cleanEmail.equalsIgnoreCase(inv.getEmail()));
            if (pendingDiffEmail) {
                throw new ApiException(HttpStatus.CONFLICT, "Department " + dept.getName() + " already has a pending invitation for " + roleName + " for another user.");
            }
        }

        // If a pending invitation already exists for this email, cancel previous ones to maintain single active invitation rule
        List<StaffInvitation> existingEmailInvs = invitationRepository.findByEmailAndStatus(cleanEmail, StaffInvitation.STATUS_PENDING);
        for (StaffInvitation oldInv : existingEmailInvs) {
            oldInv.setStatus(StaffInvitation.STATUS_CANCELLED);
            invitationRepository.save(oldInv);
        }

        // 3. Create secure token and hash
        String rawToken = TokenSecurityUtil.generateRawToken();
        String tokenHash = TokenSecurityUtil.hashToken(rawToken);

        StaffInvitation invitation = new StaffInvitation();
        invitation.setFullName(dto.getFullName().trim());
        invitation.setEmail(cleanEmail);
        invitation.setPhoneNumber(cleanPhone);
        invitation.setInstitutionId(adminInstId);
        invitation.setDepartmentId(dept.getDepartmentId());
        invitation.setRoleName(roleName);
        invitation.setTokenHash(tokenHash);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(24));
        invitation.setStatus(StaffInvitation.STATUS_PENDING);
        invitation.setInvitedBy(admin.getUserId());

        StaffInvitation saved = invitationRepository.save(invitation);

        // 4. Send Email Invitation containing raw token link
        String acceptUrl = frontendUrl + "/accept-invitation?token=" + rawToken;
        String emailBody = String.format("""
                Hello %s,

                You have been invited to join the Lab Resource Utilization Platform.

                Institution: %s
                Department:  %s
                Role:        %s
                Phone:       %s

                Please click the link below to set up your password and activate your account:
                %s

                This invitation will expire in 24 hours.

                Regards,
                Lab Resource Utilization Platform Team
                """, dto.getFullName(), inst.getName(), dept.getName(), roleName, cleanPhone, acceptUrl);

        try {
            emailService.sendEmail(cleanEmail, "Invitation to join " + inst.getName(), emailBody);
        } catch (Exception e) {
            log.warn("Failed to send invitation email to {}: {}", cleanEmail, e.getMessage());
        }

        return StaffInvitationResponseDto.fromEntity(saved, rawToken, acceptUrl, inst.getName(), dept.getName());
    }

    @Transactional
    public StaffInvitationResponseDto validateToken(String rawToken) {
        String tokenHash = TokenSecurityUtil.hashToken(rawToken);
        StaffInvitation inv = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invalid invitation token."));

        if (StaffInvitation.STATUS_ACCEPTED.equals(inv.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This invitation has already been accepted.");
        }
        if (StaffInvitation.STATUS_CANCELLED.equals(inv.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This invitation has been cancelled.");
        }
        if (inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            inv.setStatus(StaffInvitation.STATUS_EXPIRED);
            invitationRepository.save(inv);
            throw new ApiException(HttpStatus.BAD_REQUEST, "This invitation link has expired. Please ask your administrator to send a new invitation.");
        }

        String instName = institutionRepository.findById(inv.getInstitutionId()).map(Institution::getName).orElse("Institution");
        String deptName = departmentRepository.findById(inv.getDepartmentId()).map(Department::getName).orElse("Department");

        return StaffInvitationResponseDto.fromEntity(inv, instName, deptName);
    }

    @Transactional
    public UserSummaryDto acceptInvitation(AcceptInvitationRequestDto dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }

        String tokenHash = TokenSecurityUtil.hashToken(dto.getToken());
        StaffInvitation inv = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invalid invitation token."));

        if (!StaffInvitation.STATUS_PENDING.equals(inv.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invitation is not active. Status: " + inv.getStatus());
        }
        if (inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            inv.setStatus(StaffInvitation.STATUS_EXPIRED);
            invitationRepository.save(inv);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invitation link has expired.");
        }

        // Re-check duplicate user email or phone before account creation
        if (userRepository.findByEmail(inv.getEmail()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "User email is already registered.");
        }

        // Re-check role uniqueness for Department Head and Lab Manager
        String roleName = inv.getRoleName().toUpperCase();
        if ("DEPARTMENT_HEAD".equals(roleName) || "LAB_MANAGER".equals(roleName)) {
            List<AppUser> deptUsers = userRepository.findByDepartmentId(inv.getDepartmentId());
            boolean existingRole = deptUsers.stream()
                    .anyMatch(u -> Boolean.TRUE.equals(u.getIsActive()) && u.getRoles().stream().anyMatch(r -> roleName.equalsIgnoreCase(r.getRoleName())));
            if (existingRole) {
                throw new ApiException(HttpStatus.CONFLICT, "Department already has an active " + roleName + ".");
            }
        }

        // Find or create Role
        Role role = roleRepository.findByRoleName(roleName)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName(roleName);
                    return roleRepository.save(r);
                });

        // Split Full Name into First Name & Last Name
        String fullName = inv.getFullName().trim();
        String firstName = fullName;
        String lastName = "";
        int lastSpace = fullName.lastIndexOf(' ');
        if (lastSpace > 0) {
            firstName = fullName.substring(0, lastSpace);
            lastName = fullName.substring(lastSpace + 1);
        }

        AppUser user = new AppUser();
        user.setInstitutionId(inv.getInstitutionId());
        user.setDepartmentId(inv.getDepartmentId());
        user.setEmail(inv.getEmail());
        user.setPhoneNumber(inv.getPhoneNumber()); // PERSISTED TO AppUser
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setIsActive(true);
        user.setRoles(Set.of(role));

        AppUser savedUser = userRepository.save(user);

        // Mark invitation ACCEPTED
        inv.setStatus(StaffInvitation.STATUS_ACCEPTED);
        inv.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(inv);

        // If Department Head was accepted, update Department's head ID link
        if ("DEPARTMENT_HEAD".equals(roleName)) {
            Department dept = departmentRepository.findById(inv.getDepartmentId()).orElse(null);
            if (dept != null) {
                dept.setDepartmentHeadId(savedUser.getUserId());
                departmentRepository.save(dept);
            }
        }

        log.info("Staff invitation accepted successfully for email: {}, role: {}", inv.getEmail(), roleName);
        return UserSummaryDto.fromEntity(savedUser);
    }

    @Transactional(readOnly = true)
    public List<StaffInvitationResponseDto> getInvitations(UserPrincipal admin) {
        Long adminInstId = admin.getInstitutionId();
        return invitationRepository.findByInstitutionId(adminInstId).stream()
                .map(inv -> {
                    String instName = institutionRepository.findById(inv.getInstitutionId()).map(Institution::getName).orElse("Institution");
                    String deptName = departmentRepository.findById(inv.getDepartmentId()).map(Department::getName).orElse("Department");
                    return StaffInvitationResponseDto.fromEntity(inv, instName, deptName);
                })
                .toList();
    }

    @Transactional
    public void cancelInvitation(UserPrincipal admin, Long invitationId) {
        StaffInvitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found."));

        if (!admin.getInstitutionId().equals(inv.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot cancel an invitation for another institution.");
        }

        inv.setStatus(StaffInvitation.STATUS_CANCELLED);
        invitationRepository.save(inv);
    }
}
