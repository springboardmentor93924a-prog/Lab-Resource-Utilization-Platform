package com.labresource.backend.institution.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.dto.InstitutionDto;
import com.labresource.backend.institution.dto.InstitutionRegistrationRequestDto;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.labresource.backend.auth.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.labresource.backend.notification.service.NotificationService notificationService;
    private final com.labresource.backend.common.util.EmailService emailService;

    public List<InstitutionDto> getAll() {
        return institutionRepository.findAll().stream()
                .map(this::enrichWithAdminDetails)
                .toList();
    }

    public List<InstitutionDto> getPendingInstitutions() {
        return institutionRepository.findAll().stream()
                .filter(i -> "PENDING".equalsIgnoreCase(i.getApprovalStatus()))
                .map(this::enrichWithAdminDetails)
                .toList();
    }

    public InstitutionDto getById(Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));
        return enrichWithAdminDetails(inst);
    }

    public Institution getEntity(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));
    }

    public List<InstitutionDto> getActiveInstitutions() {
        return institutionRepository.findByApprovalStatusIgnoreCaseAndIsActiveTrue("APPROVED").stream()
                .map(this::enrichWithAdminDetails)
                .toList();
    }

    public boolean isCodeTaken(String code) {
        if (code == null || code.trim().isBlank()) {
            return false;
        }
        return institutionRepository.existsByCodeIgnoreCase(code.trim());
    }

    private InstitutionDto enrichWithAdminDetails(Institution inst) {
        InstitutionDto dto = InstitutionDto.fromEntity(inst);
        if (inst != null && inst.getInstitutionId() != null) {
            List<AppUser> admins = appUserRepository.findByRoleNameAndInstitutionId("INSTITUTION_ADMIN", inst.getInstitutionId());
            if (!admins.isEmpty()) {
                AppUser admin = admins.get(0);
                dto.setAdminUserId(admin.getUserId());
                dto.setAdminFirstName(admin.getFirstName());
                dto.setAdminLastName(admin.getLastName());
                dto.setAdminEmail(admin.getEmail());
                dto.setAdminPhone(admin.getPhoneNumber());
            }
        }
        return dto;
    }

    @Transactional
    public InstitutionDto registerInstitution(InstitutionRegistrationRequestDto dto) {
        if (dto.getName() == null || dto.getName().trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Institution name is required.");
        }
        if (dto.getCode() == null || dto.getCode().trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Institution code is required.");
        }
        String normalizedCode = dto.getCode().trim().toUpperCase();
        if (institutionRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ApiException(HttpStatus.CONFLICT, "Institution code '" + normalizedCode + "' is already registered.");
        }
        if (dto.getOfficialEmail() == null || dto.getOfficialEmail().trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Official contact email is required.");
        }

        Institution inst = new Institution();
        inst.setName(dto.getName().trim());
        inst.setCode(normalizedCode);
        inst.setInstitutionType(dto.getInstitutionType() != null && !dto.getInstitutionType().isBlank() ? dto.getInstitutionType().trim() : "Engineering College");
        inst.setAddress(dto.getAddress() != null ? dto.getAddress().trim() : null);
        inst.setCity(dto.getCity() != null ? dto.getCity().trim() : null);
        inst.setState(dto.getState() != null ? dto.getState().trim() : null);
        inst.setPincode(dto.getPincode() != null ? dto.getPincode().trim() : null);
        inst.setCountry(dto.getCountry() != null && !dto.getCountry().isBlank() ? dto.getCountry().trim() : "India");
        inst.setContactEmail(dto.getOfficialEmail().trim().toLowerCase());
        inst.setContactPhone(dto.getOfficialPhone() != null ? dto.getOfficialPhone().trim() : null);
        inst.setWebsite(dto.getWebsite() != null ? dto.getWebsite().trim() : null);
        inst.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        inst.setLogoSecureUrl(dto.getLogoUrl());
        inst.setIsActive(false);
        inst.setApprovalStatus("PENDING");

        Institution savedInst = institutionRepository.save(inst);

        // Auto-provision 7 default departments for this institution
        String[][] defaultDepts = {
                {"CSE", "Computer Science and Engineering"},
                {"EEE", "Electrical and Electronics Engineering"},
                {"ECE", "Electronics and Communication Engineering"},
                {"IT", "Information Technology"},
                {"AI&DS", "Artificial Intelligence and Data Science"},
                {"MECH", "Mechanical Engineering"},
                {"CIVIL", "Civil Engineering"}
        };

        for (String[] d : defaultDepts) {
            Department dept = new Department();
            dept.setInstitutionId(savedInst.getInstitutionId());
            dept.setName(d[1]);
            dept.setCode(d[0]);
            dept.setIsActive(true);
            departmentRepository.save(dept);
        }

        // Auto-provision pending Institution Admin user if admin details provided
        if (dto.getAdminEmail() != null && !dto.getAdminEmail().isBlank()) {
            String adminEmail = dto.getAdminEmail().toLowerCase().trim();
            java.util.Optional<AppUser> existingUserOpt = appUserRepository.findByEmail(adminEmail);

            Role adminRole = roleRepository.findByRoleName("INSTITUTION_ADMIN")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setRoleName("INSTITUTION_ADMIN");
                        return roleRepository.save(r);
                    });

            if (existingUserOpt.isPresent()) {
                AppUser existingUser = existingUserOpt.get();
                if (existingUser.getInstitutionId() != null && !existingUser.getInstitutionId().equals(savedInst.getInstitutionId())) {
                    throw new ApiException(HttpStatus.CONFLICT, "Email " + adminEmail + " is already associated with another institution.");
                }
                if (Boolean.TRUE.equals(existingUser.getIsActive())) {
                    throw new ApiException(HttpStatus.CONFLICT, "An active account with email " + adminEmail + " already exists.");
                }

                existingUser.setInstitutionId(savedInst.getInstitutionId());
                existingUser.setDepartmentId(null);
                if (dto.getAdminFirstName() != null && !dto.getAdminFirstName().isBlank()) {
                    existingUser.setFirstName(dto.getAdminFirstName().trim());
                }
                if (dto.getAdminLastName() != null && !dto.getAdminLastName().isBlank()) {
                    existingUser.setLastName(dto.getAdminLastName().trim());
                }
                if (dto.getAdminPhone() != null && !dto.getAdminPhone().isBlank()) {
                    existingUser.setPhoneNumber(dto.getAdminPhone().trim());
                }
                existingUser.setIsActive(false);
                existingUser.setRoles(new java.util.HashSet<>(java.util.List.of(adminRole)));
                appUserRepository.save(existingUser);
            } else {
                AppUser admin = new AppUser();
                admin.setInstitutionId(savedInst.getInstitutionId());
                admin.setDepartmentId(null);
                admin.setEmail(adminEmail);
                admin.setPasswordHash(null);
                admin.setFirstName(dto.getAdminFirstName() != null && !dto.getAdminFirstName().isBlank() ? dto.getAdminFirstName().trim() : "Institution");
                admin.setLastName(dto.getAdminLastName() != null && !dto.getAdminLastName().isBlank() ? dto.getAdminLastName().trim() : "Admin");
                admin.setPhoneNumber(dto.getAdminPhone() != null ? dto.getAdminPhone().trim() : null);
                admin.setIsActive(false);
                admin.setIsEmailVerified(false);
                admin.setIsPhoneVerified(false);
                admin.setRoles(new java.util.HashSet<>(java.util.List.of(adminRole)));
                appUserRepository.save(admin);
            }
        }

        return enrichWithAdminDetails(savedInst);
    }

    @Transactional
    public java.util.Map<String, String> approveInstitution(Long systemAdminUserId, Long institutionId) {
        Institution inst = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));

        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        // Enforce ONE active Institution Admin per approved active institution
        List<AppUser> existingAdmins = appUserRepository.findByRoleNameAndInstitutionId("INSTITUTION_ADMIN", institutionId);
        List<AppUser> activeAdmins = existingAdmins.stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .toList();

        if (activeAdmins.size() > 1) {
            throw new ApiException(HttpStatus.CONFLICT, "This institution already has multiple active Institution Administrators. Manual review required.");
        }

        inst.setIsActive(true);
        inst.setApprovalStatus("APPROVED");
        inst.setReviewedBy(systemAdminUserId);
        inst.setReviewedAt(now);
        inst.setRejectionReason(null);
        institutionRepository.save(inst);

        if (!existingAdmins.isEmpty()) {
            AppUser admin = existingAdmins.get(0);
            admin.setDepartmentId(null);
            admin.setIsEmailVerified(true);
            admin.setReviewedBy(systemAdminUserId);
            admin.setReviewedAt(now);
            admin.setRejectionReason(null);
            appUserRepository.save(admin);

            // Invalidate any existing active tokens for this user
            passwordResetTokenRepository.findAll().stream()
                    .filter(t -> admin.getUserId().equals(t.getUserId()) && !Boolean.TRUE.equals(t.getIsUsed()))
                    .forEach(t -> {
                        t.setIsUsed(true);
                        passwordResetTokenRepository.save(t);
                    });

            // Generate single-use password setup token (valid for 24 hours)
            String rawToken = java.util.UUID.randomUUID().toString();
            String tokenHash = com.labresource.backend.security.TokenHashUtil.hashToken(rawToken);

            com.labresource.backend.auth.entity.PasswordResetToken setupToken = new com.labresource.backend.auth.entity.PasswordResetToken();
            setupToken.setUserId(admin.getUserId());
            setupToken.setTokenHash(tokenHash);
            setupToken.setExpiresAt(now.plusHours(24));
            setupToken.setIsUsed(false);
            passwordResetTokenRepository.save(setupToken);

            String setupLink = "http://localhost:5173/setup-password?token=" + rawToken;
            String emailBody = "Congratulations! Your Institution Administrator application for " + inst.getName() + " has been approved.\n\n" +
                    "Please click the link below to set up your password and activate your account:\n" +
                    setupLink + "\n\nThis single-use link is valid for 24 hours.";

            try {
                emailService.sendEmail(admin.getEmail(), "Institution Registration Approved - Set Your Password", emailBody);
            } catch (Exception e) {
                // Ignore email transport failure in offline/test environments
            }

            notificationService.notifyUser(
                    admin.getUserId(),
                    "ACCOUNT_APPROVED",
                    "Institution Application Approved",
                    "Your Institution Administrator application for " + inst.getName() + " has been approved. Please check your email to set your password."
            );
        }

        return java.util.Map.of("message", "Institution approved successfully. Administrator password setup email dispatched.");
    }

    @Transactional
    public java.util.Map<String, String> rejectInstitution(Long systemAdminUserId, Long institutionId, String reason) {
        if (reason == null || reason.trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejection reason is mandatory.");
        }

        Institution inst = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        inst.setApprovalStatus("REJECTED");
        inst.setIsActive(false);
        inst.setReviewedBy(systemAdminUserId);
        inst.setReviewedAt(now);
        inst.setRejectionReason(reason.trim());
        institutionRepository.save(inst);

        List<AppUser> instAdmins = appUserRepository.findByRoleNameAndInstitutionId("INSTITUTION_ADMIN", institutionId);
        for (AppUser admin : instAdmins) {
            admin.setIsActive(false);
            admin.setReviewedBy(systemAdminUserId);
            admin.setReviewedAt(now);
            admin.setRejectionReason(reason.trim());
            appUserRepository.save(admin);

            try {
                String emailBody = "Dear " + admin.getFirstName() + ",\n\n" +
                        "Your Institution Administrator application for " + inst.getName() + " has been reviewed and rejected.\n\n" +
                        "Reason: " + reason.trim() + "\n\n" +
                        "If you believe this decision was made in error, please reach out to system support.";
                emailService.sendEmail(admin.getEmail(), "Institution Registration Application Status: Rejected", emailBody);
            } catch (Exception e) {
                // Ignore email transport failure in offline/test environments
            }
        }

        return java.util.Map.of("message", "Institution registration application rejected.");
    }

    @Transactional
    public InstitutionDto create(InstitutionDto dto) {
        Institution inst = new Institution();
        inst.setName(dto.getName());
        inst.setCode(dto.getCode() != null ? dto.getCode().toUpperCase() : null);
        inst.setInstitutionType(dto.getInstitutionType());
        inst.setAddress(dto.getAddress());
        inst.setCity(dto.getCity());
        inst.setState(dto.getState());
        inst.setPincode(dto.getPincode());
        inst.setCountry(dto.getCountry());
        inst.setContactPhone(dto.getContactPhone());
        inst.setContactEmail(dto.getContactEmail());
        inst.setWebsite(dto.getWebsite());
        inst.setDescription(dto.getDescription());
        inst.setLogoSecureUrl(dto.getLogoSecureUrl());
        inst.setIsActive(true);
        return InstitutionDto.fromEntity(institutionRepository.save(inst));
    }

    @Transactional
    public InstitutionDto update(Long id, InstitutionDto dto) {
        Institution inst = getEntity(id);
        if (dto.getName() != null) inst.setName(dto.getName());
        if (dto.getCode() != null) inst.setCode(dto.getCode().toUpperCase());
        if (dto.getInstitutionType() != null) inst.setInstitutionType(dto.getInstitutionType());
        if (dto.getAddress() != null) inst.setAddress(dto.getAddress());
        if (dto.getCity() != null) inst.setCity(dto.getCity());
        if (dto.getState() != null) inst.setState(dto.getState());
        if (dto.getPincode() != null) inst.setPincode(dto.getPincode());
        if (dto.getCountry() != null) inst.setCountry(dto.getCountry());
        if (dto.getContactPhone() != null) inst.setContactPhone(dto.getContactPhone());
        if (dto.getContactEmail() != null) inst.setContactEmail(dto.getContactEmail());
        if (dto.getWebsite() != null) inst.setWebsite(dto.getWebsite());
        if (dto.getDescription() != null) inst.setDescription(dto.getDescription());
        return InstitutionDto.fromEntity(institutionRepository.save(inst));
    }

    @Transactional
    public void delete(Long id) {
        Institution inst = getEntity(id);
        inst.setIsActive(false);
        institutionRepository.save(inst);
    }
}
