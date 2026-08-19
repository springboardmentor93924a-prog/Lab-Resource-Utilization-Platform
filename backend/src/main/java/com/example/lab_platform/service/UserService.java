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
    // admin-only POST /api/users/register endpoint. Self-registration is
    // intentionally unrestricted for every role.
    // =========================
    public User registerUser(RegisterRequest registerRequest) {
        return registerUserInternal(registerRequest);
    }

    private User registerUserInternal(RegisterRequest registerRequest) {

        // Check duplicate email
        String normalizedEmail = registerRequest.getEmail() == null
                ? null
                : registerRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already registered!");
        }

        // Find role
        Role role = roleRepository.findById(registerRequest.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Invalid role selected!")
                );

       // Find department — optional for INSTITUTION_ADMIN, who oversees the whole institution
Department department = null;
boolean isInstitutionAdmin = "INSTITUTION_ADMIN".equalsIgnoreCase(role.getRoleName());

if (!isInstitutionAdmin) {
    department = departmentRepository
            .findById(registerRequest.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Invalid department selected!"));
}

Institution institution = institutionRepository
        .findById(registerRequest.getInstitutionId())
        .orElseThrow(() -> new RuntimeException("Invalid institution selected!"));

if (department != null) {
    boolean departmentBelongsToInstitution =
        institutionDepartmentRepository.existsByInstitutionInstitutionIdAndDepartmentDepartmentId(
            institution.getInstitutionId(), department.getDepartmentId());

    if (!departmentBelongsToInstitution) {
        throw new RuntimeException("Selected department does not belong to the selected institution!");
    }
}

        // Create user
        User user = new User();

        user.setFullName(registerRequest.getFullName());
        user.setEmail(normalizedEmail);
        
        // Encode password using BCrypt instead of storing in plain text
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        
        user.setPhone(registerRequest.getPhone());

        // Set role and department
        user.setRole(role);
        user.setDepartment(department);

        user.setInstitution(institution);

        // Default status
        user.setStatus("Active");

        return userRepository.save(user);
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

        // Check account status
        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("User account is inactive!");
        }

        // Check password using passwordEncoder matches for hashed passwords
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        return user;
    }


    // =========================
    // GET ALL USERS
    // =========================
    public List<User> getAllUsers() {
        return userRepository.findAll();
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