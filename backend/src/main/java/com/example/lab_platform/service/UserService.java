package com.example.lab_platform.service;

import com.example.lab_platform.dto.LoginRequest;
import com.example.lab_platform.dto.RegisterRequest;
import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.PasswordResetToken;
import com.example.lab_platform.entity.Role;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.DepartmentRepository;
import com.example.lab_platform.repository.InstitutionDepartmentRepository;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.PasswordResetTokenRepository;
import com.example.lab_platform.repository.RoleRepository;
import com.example.lab_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(UserService.class);

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }

        return (User) authentication.getPrincipal();
    }

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Added BCrypt Password Encoder for security audit

    @Autowired
private InstitutionRepository institutionRepository;

@Autowired
private InstitutionDepartmentRepository institutionDepartmentRepository;

@Autowired
private PasswordResetTokenRepository passwordResetTokenRepository;

    // =========================
    // REGISTER USER
    // Used by both the public POST /api/auth/register endpoint and the
    // admin-only POST /api/users/register endpoint.
    //
    //  - Registration is open: every self-registered account (any role
    //    except SYSTEM_ADMIN) is Active immediately, so anyone can log in
    //    and try the platform's functionality right away. There is no
    //    approval queue - roles are picked at registration and can be
    //    corrected later by an Institution Admin / System Admin from the
    //    Users page if needed.
    //  - SYSTEM_ADMIN can never be self-registered.
    //  - A logged-in Institution Admin / System Admin creating a user
    //    from the Users page creates an already-"Active" account, since
    //    the admin is the approver.
    // =========================
    public User registerUser(RegisterRequest registerRequest) {
        return registerUserInternal(registerRequest);
    }

    private String roleKey(Role role) {
        if (role == null || role.getRoleName() == null) {
            return "";
        }
        return role.getRoleName().trim().toUpperCase().replace(" ", "_");
    }

    private String roleKey(User user) {
        return user == null ? "" : roleKey(user.getRole());
    }

    private String prettyRole(User user) {
        String key = roleKey(user).replace("_", " ").toLowerCase();
        return key.isEmpty() ? "user" : Character.toUpperCase(key.charAt(0)) + key.substring(1);
    }

    private User registerUserInternal(RegisterRequest registerRequest) {

        User caller = getLoggedInUser();
        String callerRole = roleKey(caller);

        // Only a logged-in Institution Admin / System Admin creates
        // ready-to-use accounts. Anyone else - including a logged-in
        // user who calls the public endpoint - is a self-registration.
        boolean createdByAdmin = callerRole.equals("INSTITUTION_ADMIN")
                || callerRole.equals("SYSTEM_ADMIN");

        // If this is an authenticated INSTITUTION_ADMIN registering a
        // user, the institutionId in the request body is NEVER trusted -
        // it's always forced to the admin's own institution.
        if (callerRole.equals("INSTITUTION_ADMIN")) {

            if (caller.getInstitution() == null) {
                throw new RuntimeException("Your account has no institution on file");
            }

            registerRequest.setInstitutionId(caller.getInstitution().getInstitutionId());
        }

        // Check duplicate email. A previously REJECTED request may be
        // submitted again (the same account record is reused).
        String normalizedEmail = registerRequest.getEmail() == null
                ? null
                : registerRequest.getEmail().trim().toLowerCase();

        User existingUser = normalizedEmail == null
                ? null
                : userRepository.findByEmail(normalizedEmail).orElse(null);

        if (existingUser != null) {

            throw new RuntimeException("Email is already registered!");
        }

        // Find role
        Role role = roleRepository.findById(registerRequest.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Invalid role selected!")
                );

        String targetRole = roleKey(role);

        // A System Admin can only ever be created by another System Admin.
        if (targetRole.equals("SYSTEM_ADMIN") && !callerRole.equals("SYSTEM_ADMIN")) {
            throw new RuntimeException(
                    "System Admin accounts cannot be created through registration. "
                            + "Contact the platform owner.");
        }

        // Institution/Department requirements are role-dependent:
        //   - SYSTEM_ADMIN:       platform-wide - no institution, no department.
        //   - INSTITUTION_ADMIN:  needs an institution, no single department.
        //   - every other role:   needs both.
        boolean isSystemAdmin = targetRole.equals("SYSTEM_ADMIN");
        boolean isInstitutionAdmin = targetRole.equals("INSTITUTION_ADMIN");

        // A new college's head can register before the college exists in
        // the system: they type the college name instead of picking one,
        // and it is created right away (there is no approval step to wait
        // for - see the comment at the top of this method).
        final String newInstitutionName = registerRequest.getNewInstitutionName() == null
                ? ""
                : registerRequest.getNewInstitutionName().trim();

        String newInstitutionLocation = registerRequest.getNewInstitutionLocation() == null
                ? ""
                : registerRequest.getNewInstitutionLocation().trim();

        boolean requestsNewInstitution = isInstitutionAdmin
                && registerRequest.getInstitutionId() == null
                && !newInstitutionName.isEmpty();

        Institution institution = null;
        Department department = null;

        if (requestsNewInstitution) {

            if (newInstitutionName.length() > 150 || newInstitutionLocation.length() > 200) {
                throw new RuntimeException("College name or location is too long.");
            }

            if (institutionRepository.existsByInstitutionNameIgnoreCase(newInstitutionName)) {
                throw new RuntimeException(
                        "A college with this name is already registered. "
                                + "Select it from the list instead.");
            }

            Institution newInstitution = new Institution();
            newInstitution.setInstitutionName(newInstitutionName);
            newInstitution.setLocation(newInstitutionLocation.isEmpty() ? null : newInstitutionLocation);

            institution = institutionRepository.save(newInstitution);

        } else if (!isSystemAdmin) {

            if (registerRequest.getInstitutionId() == null) {
                throw new RuntimeException("Institution is required for this role!");
            }

            institution = institutionRepository
                    .findById(registerRequest.getInstitutionId())
                    .orElseThrow(() -> new RuntimeException("Invalid institution selected!"));

            if (!isInstitutionAdmin) {

                if (registerRequest.getDepartmentId() == null) {
                    throw new RuntimeException("Department is required for this role!");
                }

                department = departmentRepository
                        .findById(registerRequest.getDepartmentId())
                        .orElseThrow(() -> new RuntimeException("Invalid department selected!"));

                boolean departmentBelongsToInstitution =
                    institutionDepartmentRepository.existsByInstitutionInstitutionIdAndDepartmentDepartmentId(
                        institution.getInstitutionId(), department.getDepartmentId());

                if (!departmentBelongsToInstitution) {
                    throw new RuntimeException("Selected department does not belong to the selected institution!");
                }
            }
        }

        // Create (or refresh a rejected) user
        User user = existingUser != null ? existingUser : new User();

        user.setFullName(registerRequest.getFullName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setRole(role);
        user.setDepartment(department);
        user.setInstitution(institution);
        user.setStatusReason(null);
        user.setStatus("Active");

        return userRepository.save(user);
    }


    // =========================
    // PROFILE
    // Every logged-in user manages their OWN profile: name, phone and
    // password. Email, role, institution and department can only be
    // changed by an administrator.
    // =========================
    public User getMyProfile() {

        User me = getLoggedInUser();

        if (me == null) {
            throw new RuntimeException("You are not logged in");
        }

        return userRepository.findById(me.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateMyProfile(String fullName, String phone) {

        User user = getMyProfile();

        String cleanName = fullName == null ? "" : fullName.trim();

        if (cleanName.length() < 2 || cleanName.length() > 100) {
            throw new RuntimeException("Name must be between 2 and 100 characters");
        }

        String cleanPhone = phone == null ? "" : phone.trim();

        if (!cleanPhone.isEmpty() && !cleanPhone.matches("^[+]?[0-9 ()-]{7,20}$")) {
            throw new RuntimeException("Enter a valid phone number");
        }

        user.setFullName(cleanName);
        user.setPhone(cleanPhone.isEmpty() ? null : cleanPhone);

        return userRepository.save(user);
    }

    public void changeMyPassword(String currentPassword, String newPassword) {

        User user = getMyProfile();

        if (currentPassword == null
                || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from the current one");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }


    // =========================
    // LOGIN USER
    // =========================
    public User loginUser(LoginRequest loginRequest) {

        String normalizedEmail = loginRequest.getEmail() == null
                ? null
                : loginRequest.getEmail().trim().toLowerCase();

        Optional<User> userOptional =
                userRepository.findByEmail(normalizedEmail);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }

        User user = userOptional.get();

        // Check the password FIRST, so the account's approval status is
        // only revealed to someone who actually knows the password.
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        assertCanLogin(user);

        return user;
    }

    // Shared by password login and Google sign-in. Registration is open
    // (no approval queue), so the only reason an account isn't Active is
    // an administrator deactivating it from the Users page.
    private void assertCanLogin(User user) {

        String status = user.getStatus() == null ? "" : user.getStatus();

        if (!"Active".equalsIgnoreCase(status)) {
            throw new RuntimeException("User account is inactive!");
        }
    }

    // "Sign in with Google": Google has already proven the email belongs to
    // this person. We still require an EXISTING, APPROVED account - Google
    // sign-in never creates an account or grants any role.
    public User loginWithGoogleEmail(String verifiedEmail) {

        User user = userRepository.findByEmail(verifiedEmail)
                .orElseThrow(() -> new RuntimeException(
                        "No account found for this Google email. Please register first "
                                + "using the same email address."));

        assertCanLogin(user);

        return user;
    }


    // =========================
    // GET ALL USERS
    // =========================
    public List<User> getAllUsers() {
        User loggedInUser = getLoggedInUser();

        if (loggedInUser != null
                && "SYSTEM_ADMIN".equalsIgnoreCase(loggedInUser.getRole().getRoleName())) {
            return userRepository.findAll();
        }

        if (loggedInUser == null || loggedInUser.getInstitution() == null) {
            return new java.util.ArrayList<>();
        }

        return userRepository.findByInstitution_InstitutionId(
                loggedInUser.getInstitution().getInstitutionId()
        );
    }

    public String createPasswordResetToken(String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No account found with that email"));

    String token = java.util.UUID.randomUUID().toString();

    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setToken(token);
    resetToken.setUser(user);
    resetToken.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(30));
    resetToken.setUsed(false);

    passwordResetTokenRepository.save(resetToken);

    return token;
}

public void resetPassword(String token, String newPassword) {
    PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

    if (Boolean.TRUE.equals(resetToken.getUsed())) {
        throw new RuntimeException("This reset link has already been used");
    }

    if (resetToken.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
        throw new RuntimeException("This reset link has expired");
    }

    User user = resetToken.getUser();
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    resetToken.setUsed(true);
    passwordResetTokenRepository.save(resetToken);
}

    // =========================
    // GET USER BY ID
    // =========================
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
}