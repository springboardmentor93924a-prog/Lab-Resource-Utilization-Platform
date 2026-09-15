package com.labresource.backend.user.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.role.repository.RoleRepository;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.invitation.entity.StaffInvitation;
import com.labresource.backend.invitation.repository.StaffInvitationRepository;
import com.labresource.backend.user.dto.DepartmentStaffGroupDto;
import com.labresource.backend.user.dto.InstitutionStaffRosterDto;
import com.labresource.backend.user.dto.StaffMemberDto;
import com.labresource.backend.user.dto.StudentDetailsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import com.labresource.backend.common.util.EmailService;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final BookingRepository bookingRepository;
    private final CostRecordRepository costRecordRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final StaffInvitationRepository staffInvitationRepository;

    private final com.labresource.backend.auth.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional(readOnly = true)
    public InstitutionStaffRosterDto getInstitutionStaffRoster(UserPrincipal admin) {
        Long instId = admin.getInstitutionId();
        if (instId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution Admin must belong to an institution.");
        }

        Institution institution = institutionRepository.findById(instId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));

        String instName = institution.getName();
        String instCode = institution.getCode();

        List<Department> departments = departmentRepository.findByInstitutionIdAndIsActiveTrue(instId);
        Map<Long, Department> deptMap = departments.stream()
                .collect(Collectors.toMap(Department::getDepartmentId, d -> d, (a, b) -> a));

        // Fetch all users for this institution
        List<AppUser> allUsers = appUserRepository.findByInstitutionId(instId);

        // Filter staff users (DEPARTMENT_HEAD, LAB_MANAGER, LAB_TECHNICIAN, TECHNICIAN)
        List<StaffMemberDto> staffDtos = new ArrayList<>();
        for (AppUser user : allUsers) {
            boolean isStaff = user.getRoles().stream().anyMatch(r -> {
                String rn = r.getRoleName();
                return "DEPARTMENT_HEAD".equalsIgnoreCase(rn) ||
                        "LAB_MANAGER".equalsIgnoreCase(rn) ||
                        "LAB_TECHNICIAN".equalsIgnoreCase(rn) ||
                        "TECHNICIAN".equalsIgnoreCase(rn);
            });
            if (isStaff) {
                Department dept = user.getDepartmentId() != null ? deptMap.get(user.getDepartmentId()) : null;
                if (dept == null && user.getDepartmentId() != null) {
                    dept = departmentRepository.findById(user.getDepartmentId()).orElse(null);
                }
                String deptName = dept != null ? dept.getName() : "Unassigned Department";
                String deptCode = dept != null ? dept.getCode() : null;
                staffDtos.add(StaffMemberDto.fromAppUser(user, instName, instCode, deptName, deptCode));
            }
        }

        // Precedence set: Active user emails will never be shadowed by invitations
        Set<String> activeUserEmails = staffDtos.stream()
                .map(s -> s.getEmail() != null ? s.getEmail().trim().toLowerCase() : "")
                .filter(e -> !e.isEmpty())
                .collect(Collectors.toSet());

        // Fetch pending staff invitations
        List<StaffInvitation> invitations = staffInvitationRepository.findByInstitutionId(instId);
        for (StaffInvitation inv : invitations) {
            String invEmail = inv.getEmail() != null ? inv.getEmail().trim().toLowerCase() : "";
            if (activeUserEmails.contains(invEmail)) {
                continue; // Active AppUser account takes authoritative precedence
            }
            if (StaffInvitation.STATUS_PENDING.equalsIgnoreCase(inv.getStatus())) {
                Department dept = inv.getDepartmentId() != null ? deptMap.get(inv.getDepartmentId()) : null;
                if (dept == null && inv.getDepartmentId() != null) {
                    dept = departmentRepository.findById(inv.getDepartmentId()).orElse(null);
                }
                String deptName = dept != null ? dept.getName() : "Unassigned Department";
                String deptCode = dept != null ? dept.getCode() : null;
                staffDtos.add(StaffMemberDto.fromStaffInvitation(inv, instName, instCode, deptName, deptCode));
            }
        }

        // Sort staff: ACTIVE first, then alphabetical by name
        staffDtos.sort((a, b) -> {
            boolean aActive = "ACTIVE".equalsIgnoreCase(a.getStatus());
            boolean bActive = "ACTIVE".equalsIgnoreCase(b.getStatus());
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            String nameA = a.getFullName() != null ? a.getFullName() : "";
            String nameB = b.getFullName() != null ? b.getFullName() : "";
            return nameA.compareToIgnoreCase(nameB);
        });

        // Group by department
        Map<Long, List<StaffMemberDto>> staffByDeptId = new HashMap<>();
        for (StaffMemberDto s : staffDtos) {
            Long dId = s.getDepartmentId() != null ? s.getDepartmentId() : -1L;
            staffByDeptId.computeIfAbsent(dId, k -> new ArrayList<>()).add(s);
        }

        List<DepartmentStaffGroupDto> deptGroups = new ArrayList<>();
        for (Department dept : departments) {
            List<StaffMemberDto> deptStaff = staffByDeptId.getOrDefault(dept.getDepartmentId(), Collections.emptyList());
            int heads = 0;
            int managers = 0;
            int techs = 0;
            for (StaffMemberDto sm : deptStaff) {
                if ("DEPARTMENT_HEAD".equalsIgnoreCase(sm.getRole())) heads++;
                else if ("LAB_MANAGER".equalsIgnoreCase(sm.getRole())) managers++;
                else if ("LAB_TECHNICIAN".equalsIgnoreCase(sm.getRole()) || "TECHNICIAN".equalsIgnoreCase(sm.getRole())) techs++;
            }
            deptGroups.add(DepartmentStaffGroupDto.builder()
                    .departmentId(dept.getDepartmentId())
                    .departmentName(dept.getName())
                    .departmentCode(dept.getCode())
                    .headCount(heads)
                    .managerCount(managers)
                    .technicianCount(techs)
                    .totalStaffCount(deptStaff.size())
                    .staff(deptStaff)
                    .build());
        }

        // Global counts
        int totalActive = 0;
        int totalPending = 0;
        int totalInactive = 0;
        int totalHeads = 0;
        int totalManagers = 0;
        int totalTechs = 0;

        for (StaffMemberDto sm : staffDtos) {
            String st = sm.getStatus() != null ? sm.getStatus().toUpperCase() : "";
            if ("ACTIVE".equals(st)) {
                totalActive++;
            } else if ("INVITED".equals(st) || "PENDING".equals(st) || "PENDING_SETUP".equals(st)) {
                totalPending++;
            } else {
                totalInactive++;
            }

            if ("DEPARTMENT_HEAD".equalsIgnoreCase(sm.getRole())) totalHeads++;
            else if ("LAB_MANAGER".equalsIgnoreCase(sm.getRole())) totalManagers++;
            else if ("LAB_TECHNICIAN".equalsIgnoreCase(sm.getRole()) || "TECHNICIAN".equalsIgnoreCase(sm.getRole())) totalTechs++;
        }

        return InstitutionStaffRosterDto.builder()
                .institutionId(instId)
                .institutionName(instName)
                .institutionCode(instCode)
                .totalStaffCount(staffDtos.size())
                .activeCount(totalActive)
                .pendingCount(totalPending)
                .inactiveCount(totalInactive)
                .departmentHeadCount(totalHeads)
                .labManagerCount(totalManagers)
                .technicianCount(totalTechs)
                .departments(deptGroups)
                .allStaff(staffDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public StaffMemberDto getStaffDetails(UserPrincipal admin, Long targetUserId) {
        Long instId = admin.getInstitutionId();
        if (instId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution Admin must belong to an institution.");
        }

        AppUser user = appUserRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff member not found."));

        if (!instId.equals(user.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only view staff within your own institution.");
        }

        String instName = institutionRepository.findById(instId).map(Institution::getName).orElse("Institution");
        String instCode = institutionRepository.findById(instId).map(Institution::getCode).orElse(null);
        String deptName = user.getDepartmentId() != null ? departmentRepository.findById(user.getDepartmentId()).map(Department::getName).orElse("Unassigned") : "Unassigned";
        String deptCode = user.getDepartmentId() != null ? departmentRepository.findById(user.getDepartmentId()).map(Department::getCode).orElse(null) : null;

        return StaffMemberDto.fromAppUser(user, instName, instCode, deptName, deptCode);
    }

    @Transactional(readOnly = true)
    public List<StudentDetailsDto> getStudents(UserPrincipal admin, Boolean activeOnly, Long departmentId) {
        Long instId = admin.getInstitutionId();
        if (instId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution Admin must belong to an institution.");
        }

        List<AppUser> students = appUserRepository.findByRoleNameAndInstitutionId(Role.RESEARCHER, instId);

        return students.stream()
                .filter(s -> departmentId == null || (s.getDepartmentId() != null && s.getDepartmentId().equals(departmentId)))
                .filter(s -> activeOnly == null || (Boolean.TRUE.equals(activeOnly) ? Boolean.TRUE.equals(s.getIsActive()) : !Boolean.TRUE.equals(s.getIsActive())))
                .map(s -> {
                    String instName = institutionRepository.findById(instId).map(Institution::getName).orElse("Institution");
                    String deptName = s.getDepartmentId() != null ? departmentRepository.findById(s.getDepartmentId()).map(Department::getName).orElse("General") : "General";
                    return StudentDetailsDto.fromEntity(s, instName, deptName, 0L, BigDecimal.ZERO);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentDetailsDto getStudentDetails(UserPrincipal admin, Long studentUserId) {
        Long instId = admin.getInstitutionId();
        if (instId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution Admin must belong to an institution.");
        }

        AppUser student = appUserRepository.findById(studentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student/Researcher not found."));

        if (!instId.equals(student.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only view students within your own institution.");
        }

        String instName = institutionRepository.findById(instId).map(Institution::getName).orElse("Institution");
        String deptName = student.getDepartmentId() != null ? departmentRepository.findById(student.getDepartmentId()).map(Department::getName).orElse("General") : "General";

        return StudentDetailsDto.fromEntity(student, instName, deptName, 0L, BigDecimal.ZERO);
    }

    @Transactional
    public java.util.Map<String, String> verifyInstitutionAdmin(Long systemAdminUserId, Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        boolean isInstAdmin = user.getRoles().stream()
                .anyMatch(r -> Role.INSTITUTION_ADMIN.equals(r.getRoleName()));

        if (!isInstAdmin) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The target user is not registered as an Institution Administrator.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (user.getInstitutionId() != null) {
            institutionRepository.findById(user.getInstitutionId()).ifPresent(inst -> {
                inst.setIsActive(true);
                inst.setApprovalStatus("APPROVED");
                inst.setReviewedBy(systemAdminUserId);
                inst.setReviewedAt(now);
                inst.setRejectionReason(null);
                institutionRepository.save(inst);
            });
        }

        user.setIsEmailVerified(true);
        user.setReviewedBy(systemAdminUserId);
        user.setReviewedAt(now);
        user.setRejectionReason(null);
        appUserRepository.save(user);

        // Generate account setup token
        String rawToken = java.util.UUID.randomUUID().toString();
        String tokenHash = com.labresource.backend.security.TokenHashUtil.hashToken(rawToken);

        com.labresource.backend.auth.entity.PasswordResetToken setupToken = new com.labresource.backend.auth.entity.PasswordResetToken();
        setupToken.setUserId(user.getUserId());
        setupToken.setTokenHash(tokenHash);
        setupToken.setExpiresAt(now.plusDays(7));
        setupToken.setIsUsed(false);
        passwordResetTokenRepository.save(setupToken);

        String setupLink = "http://localhost:5173/setup-password?token=" + rawToken;
        String emailBody = "Congratulations! Your Institution Administrator account application has been approved.\n" +
                "Please click the link below to set your password and activate your account:\n" +
                setupLink + "\n\nThis link is valid for 7 days.";
        emailService.sendEmail(user.getEmail(), "Account Approved - Set Your Password", emailBody);

        log.info("Institution Admin with email {} verified by System Admin ID {}. Account setup link dispatched via email.", user.getEmail(), systemAdminUserId);

        notificationService.notifyUser(
                user.getUserId(),
                "ACCOUNT_VERIFIED",
                "Account Application Approved",
                "Your Institution Administrator application has been approved. An account setup link has been sent to your email."
        );

        return java.util.Map.of(
                "message", "Institution Administrator verified successfully. Account setup email has been dispatched."
        );
    }

    @Transactional
    public java.util.Map<String, String> rejectInstitution(Long systemAdminUserId, Long institutionId, String reason) {
        if (reason == null || reason.trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejection reason is mandatory.");
        }

        Institution inst = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));

        LocalDateTime now = LocalDateTime.now();
        inst.setApprovalStatus("REJECTED");
        inst.setIsActive(false);
        inst.setReviewedBy(systemAdminUserId);
        inst.setReviewedAt(now);
        inst.setRejectionReason(reason.trim());
        institutionRepository.save(inst);

        // Deactivate associated pending admin accounts
        List<AppUser> instAdmins = appUserRepository.findByRoleNameAndInstitutionId(Role.INSTITUTION_ADMIN, institutionId);
        for (AppUser admin : instAdmins) {
            admin.setIsActive(false);
            admin.setReviewedBy(systemAdminUserId);
            admin.setReviewedAt(now);
            admin.setRejectionReason(reason.trim());
            appUserRepository.save(admin);
        }

        log.info("Institution ID {} rejected by System Admin ID {}. Reason: {}", institutionId, systemAdminUserId, reason);

        return java.util.Map.of(
                "message", "Institution registration application rejected."
        );
    }

    @Transactional
    public java.util.Map<String, String> approveStudent(Long instAdminUserId, Long studentUserId) {
        AppUser admin = appUserRepository.findById(instAdminUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution Admin not found."));

        AppUser student = appUserRepository.findById(studentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student/Researcher not found."));

        if (admin.getInstitutionId() == null || !admin.getInstitutionId().equals(student.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only approve students within your own institution.");
        }

        boolean isStudent = student.getRoles().stream()
                .anyMatch(r -> Role.RESEARCHER.equals(r.getRoleName()));

        if (!isStudent) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The target user is not a Student/Researcher.");
        }

        LocalDateTime now = LocalDateTime.now();
        student.setIsEmailVerified(true);
        student.setReviewedBy(instAdminUserId);
        student.setReviewedAt(now);
        student.setRejectionReason(null);
        appUserRepository.save(student);

        // Generate account setup token
        String rawToken = java.util.UUID.randomUUID().toString();
        String tokenHash = com.labresource.backend.security.TokenHashUtil.hashToken(rawToken);

        com.labresource.backend.auth.entity.PasswordResetToken setupToken = new com.labresource.backend.auth.entity.PasswordResetToken();
        setupToken.setUserId(student.getUserId());
        setupToken.setTokenHash(tokenHash);
        setupToken.setExpiresAt(now.plusDays(7));
        setupToken.setIsUsed(false);
        passwordResetTokenRepository.save(setupToken);

        String setupLink = "http://localhost:5173/setup-password?token=" + rawToken;
        String emailBody = "Congratulations! Your Student/Researcher registration application has been approved by your Institution Administrator.\n" +
                "Please click the link below to set your password and activate your account:\n" +
                setupLink + "\n\nThis link is valid for 7 days.";
        emailService.sendEmail(student.getEmail(), "Account Approved - Set Your Password", emailBody);

        log.info("Student with email {} approved by Institution Admin ID {}. Account setup link dispatched via email.", student.getEmail(), instAdminUserId);

        notificationService.notifyUser(
                student.getUserId(),
                "ACCOUNT_APPROVED",
                "Registration Approved",
                "Your Student/Researcher registration has been approved. An account setup link has been sent to your email."
        );

        return java.util.Map.of(
                "message", "Student/Researcher approved successfully. Account setup email has been dispatched."
        );
    }

    @Transactional
    public void rejectStudent(UserPrincipal admin, Long studentUserId, String reason) {
        if (reason == null || reason.trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejection reason is mandatory.");
        }

        AppUser student = appUserRepository.findById(studentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student/Researcher not found."));

        if (admin.getInstitutionId() == null || !admin.getInstitutionId().equals(student.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only reject students within your own institution.");
        }

        LocalDateTime now = LocalDateTime.now();
        student.setIsActive(false);
        student.setReviewedBy(admin.getUserId());
        student.setReviewedAt(now);
        student.setRejectionReason(reason.trim());
        appUserRepository.save(student);

        log.info("Student with email {} rejected by Institution Admin ID {}. Reason: {}", student.getEmail(), admin.getUserId(), reason);
    }

    @Transactional
    public void assignDepartmentRole(Long managerUserId, Long targetUserId, Long departmentId, String roleName) {
        AppUser manager = appUserRepository.findById(managerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager not found."));

        AppUser target = appUserRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Target user not found."));

        if (!manager.getInstitutionId().equals(target.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only assign roles to users in your own institution.");
        }

        if (!Role.DEPARTMENT_HEAD.equalsIgnoreCase(roleName) &&
                !Role.LAB_MANAGER.equalsIgnoreCase(roleName) &&
                !Role.LAB_TECHNICIAN.equalsIgnoreCase(roleName)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only DEPARTMENT_HEAD, LAB_MANAGER, or LAB_TECHNICIAN can be assigned to departments.");
        }

        Role role = roleRepository.findByRoleName(roleName.toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Role " + roleName + " not found."));

        target.setDepartmentId(departmentId);
        target.setRoles(new HashSet<>() {{ add(role); }});
        target.setIsActive(true);
        appUserRepository.save(target);

        log.info("User {} assigned to Department ID {} with Role {}.", target.getEmail(), departmentId, roleName);

        notificationService.notifyUser(
                target.getUserId(),
                "ROLE_ASSIGNED",
                "Role Assigned: " + roleName,
                "You have been assigned as a " + roleName + " in department ID: " + departmentId
        );
    }

    @Transactional
    public void deactivateStaff(UserPrincipal admin, Long targetUserId, String reason) {
        Long adminInstId = admin.getInstitutionId();
        if (adminInstId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution Admin must belong to an institution.");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A valid reason for deactivation is required.");
        }

        AppUser target = appUserRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff member not found."));

        if (!adminInstId.equals(target.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only deactivate staff within your own institution.");
        }

        target.setIsActive(false);
        target.setDeactivatedAt(LocalDateTime.now());
        target.setDeactivationReason(reason.trim());
        target.setDeactivatedBy(admin.getUserId());
        appUserRepository.save(target);

        log.info("Staff member {} (ID {}) deactivated by Admin ID {} for reason: {}", target.getEmail(), target.getUserId(), admin.getUserId(), reason.trim());

        String instName = institutionRepository.findById(adminInstId).map(Institution::getName).orElse("Institution");
        String deptName = target.getDepartmentId() != null ? departmentRepository.findById(target.getDepartmentId()).map(Department::getName).orElse("Department") : "Department";
        String roleName = target.getRoles().stream().findFirst().map(Role::getRoleName).orElse("Staff Member");

        String emailBody = String.format("""
                Hello %s %s,

                Your account for the Lab Resource Utilization Platform has been deactivated.

                Institution: %s
                Department:  %s
                Role:        %s

                Reason:
                "%s"

                Date: %s

                If you believe this was done in error, please contact your institution administrator.

                Regards,
                Lab Resource Utilization Platform Team
                """, target.getFirstName(), target.getLastName() != null ? target.getLastName() : "",
                instName, deptName, roleName, reason.trim(), LocalDateTime.now());

        try {
            emailService.sendEmail(target.getEmail(), "Your Lab Resource Platform Account Has Been Deactivated", emailBody);
        } catch (Exception e) {
            log.warn("Failed to send deactivation email to {}: {}", target.getEmail(), e.getMessage());
        }
    }
}
