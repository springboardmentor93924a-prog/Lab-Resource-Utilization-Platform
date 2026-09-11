package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.DTOs.LoginRequestDTO;
import com.infosys.labresource.user.DTOs.RegisterRequestDTO;
import com.infosys.labresource.user.DTOs.UpdateUserDTO;
import com.infosys.labresource.user.Repository.DepartmentRepo;
import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    private final UserRepository userRepo;
    private final InstitutionRepo institutionRepo;
    private final DepartmentRepo departRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserEntity registerUser(RegisterRequestDTO req) {
        // 1. Role validation check
        if (req.getRole() == null) {
            throw new RuntimeException("Role is required.");
        }
        if (req.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("System Administrator cannot self register.");
        }

        // 2. Check if email already exists
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }

        // 3. Validate Institution (Required for all non-SYSTEM_ADMIN roles)
        if (req.getInstitutionId() == null) {
            throw new RuntimeException("Institution ID is required for role: " + req.getRole());
        }
        Institution institution = institutionRepo.findById(req.getInstitutionId())
                .orElseThrow(() -> new RuntimeException("Institution not found."));

        // 4. Validate Department (Required for Department-level roles, null for INSTITUTION_ADMIN)
        Department department = null;
        if (req.getRole() != Role.INSTITUTION_ADMIN) {
            if (req.getDepartmentId() == null) {
                throw new RuntimeException("Department ID is required for role: " + req.getRole());
            }
            department = departRepo.findById(req.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found."));
        }

        // 5. Populate User entity
        UserEntity user = new UserEntity();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(req.getRole());
        user.setInstitution(institution);
        user.setDepartment(department);

        // 6. Handle Role-specific approval logic
        switch (req.getRole()) {
            case RESEARCHER -> {
                user.setIsActive(true);
                return userRepo.save(user);
            }
            case LAB_TECHNICIAN, LAB_MANAGER -> {
                user.setIsActive(false);
                return userRepo.save(user);
            }
            case DEPARTMENT_HEAD -> {
                boolean institutionAdminExists = userRepo.existsByInstitutionAndRole(
                        institution,
                        Role.INSTITUTION_ADMIN);

                if (!institutionAdminExists) {
                    throw new RuntimeException("No Institution Administrator found for this institution.");
                }
                user.setIsActive(false);
                return userRepo.save(user);
            }
            case INSTITUTION_ADMIN -> {
                boolean systemAdminExists = userRepo.existsByRole(Role.SYSTEM_ADMIN);

                if (!systemAdminExists) {
                    throw new RuntimeException("No System Administrator found.");
                }
                user.setIsActive(false);
                return userRepo.save(user);
            }
            default -> throw new RuntimeException("Invalid role.");
        }
    }

    @Override
    public List<UserEntity> getAllUsers(Authentication authentication){
        UserEntity loggedInUser = userRepo
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        switch (loggedInUser.getRole()) {

            case SYSTEM_ADMIN:
                return userRepo.findAll();

            case INSTITUTION_ADMIN:
                return userRepo.findByInstitution(
                        loggedInUser.getInstitution());

            case DEPARTMENT_HEAD:
                return userRepo.findByDepartment(
                        loggedInUser.getDepartment());

            default:
                throw new RuntimeException("Access Denied");
        }
    }

    @Override
    public UserEntity getUserByEmail(String email,Authentication auth) {
        UserEntity loggedInUser = userRepo
                .findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserEntity requestedUser = userRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        switch (loggedInUser.getRole()) {

            case SYSTEM_ADMIN:
                return requestedUser;

            case INSTITUTION_ADMIN:

                if (!loggedInUser.getInstitution()
                        .equals(requestedUser.getInstitution())) {

                    throw new RuntimeException("Access Denied");
                }
                return requestedUser;
            case DEPARTMENT_HEAD:

                if (!loggedInUser.getDepartment()
                        .equals(requestedUser.getDepartment())) {

                    throw new RuntimeException("Access Denied");
                }
                return requestedUser;
            default:

                if (!loggedInUser.getEmail()
                        .equals(requestedUser.getEmail())) {

                    throw new RuntimeException("Access Denied");
                }

                return requestedUser;
        }
    }

    @Override
    public UserEntity updateUser(String email,UpdateUserDTO request){
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getDepartmentId() != null) {

            Department department = departRepo.findById(request.getDepartmentId())
                    .orElseThrow(() ->
                            new RuntimeException("Department not found"));

            user.setDepartment(department);
        }

        return userRepo.save(user);
    }

    @Override
    public void deleteUser(String email,Authentication auth){

        String loggedInEmail = auth.getName();

        UserEntity loggedInUser = userRepo.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("Logged in user not found."));

        UserEntity targetUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Target user not found."));

        // Researcher can delete only himself
        if (loggedInUser.getRole() == Role.RESEARCHER) {

            if (!loggedInUser.getEmail().equals(targetUser.getEmail())) {
                throw new RuntimeException("Access Denied");
            }

            userRepo.delete(targetUser);
            return;
        }

        switch (loggedInUser.getRole()) {

            case SYSTEM_ADMIN -> {

                if (targetUser.getRole() == Role.SYSTEM_ADMIN) {
                    throw new RuntimeException("System Admin cannot delete another System Admin.");
                }

                userRepo.delete(targetUser);
            }

            case INSTITUTION_ADMIN -> {

                if (!loggedInUser.getInstitution()
                        .equals(targetUser.getInstitution())) {

                    throw new RuntimeException("User belongs to another institution.");
                }

                if (targetUser.getRole() == Role.DEPARTMENT_HEAD ||
                        targetUser.getRole() == Role.LAB_MANAGER ||
                        targetUser.getRole() == Role.LAB_TECHNICIAN ||
                        targetUser.getRole() == Role.RESEARCHER) {

                    userRepo.delete(targetUser);

                } else {

                    throw new RuntimeException("Access Denied");
                }
            }

            case DEPARTMENT_HEAD -> {

                if (!loggedInUser.getDepartment()
                        .equals(targetUser.getDepartment())) {

                    throw new RuntimeException("User belongs to another department.");
                }

                if (targetUser.getRole() == Role.LAB_MANAGER ||
                        targetUser.getRole() == Role.LAB_TECHNICIAN ||
                        targetUser.getRole() == Role.RESEARCHER) {

                    userRepo.delete(targetUser);

                } else {

                    throw new RuntimeException("Access Denied");
                }
            }

            case LAB_MANAGER -> {

                if (!loggedInUser.getDepartment()
                        .equals(targetUser.getDepartment())) {

                    throw new RuntimeException("User belongs to another department.");
                }

                if (targetUser.getRole() == Role.RESEARCHER) {

                    userRepo.delete(targetUser);

                } else {

                    throw new RuntimeException("Access Denied");
                }
            }

            default ->
                    throw new RuntimeException("Access Denied");
        }
    }

    @Override
    public List<UserEntity> getPendingUsers(Authentication auth) {
        UserEntity loggedUser = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (loggedUser.getRole() == Role.SYSTEM_ADMIN) {

            return userRepo.findByIsActiveFalse()
                    .stream()
                    .filter(user -> user.getRole() == Role.INSTITUTION_ADMIN)
                    .toList();
        }

        if (loggedUser.getRole() == Role.INSTITUTION_ADMIN) {

            return userRepo.findByInstitutionAndIsActiveFalse(loggedUser.getInstitution())
                    .stream()
                    .filter(user -> user.getRole() == Role.DEPARTMENT_HEAD)
                    .toList();
        }

        if (loggedUser.getRole() == Role.DEPARTMENT_HEAD) {

            return userRepo.findByDepartmentAndIsActiveFalse(loggedUser.getDepartment())
                    .stream()
                    .filter(user ->
                            user.getRole() == Role.LAB_MANAGER
                                    || user.getRole() == Role.LAB_TECHNICIAN)
                    .toList();
        }

        throw new RuntimeException("Access Denied.");
    }

    @Override
    public UserEntity approveUser(String email, Authentication auth) {
        UserEntity loggedUser = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found."));

        UserEntity pendingUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (pendingUser.getIsActive()) {
            throw new RuntimeException("User is already active.");
        }

        if (loggedUser.getRole() == Role.SYSTEM_ADMIN) {

            if (pendingUser.getRole() != Role.INSTITUTION_ADMIN) {
                throw new RuntimeException("Access Denied.");
            }

            pendingUser.setIsActive(true);
            return userRepo.save(pendingUser);
        }

        if (loggedUser.getRole() == Role.INSTITUTION_ADMIN) {

            if (!loggedUser.getInstitution().equals(pendingUser.getInstitution())) {
                throw new RuntimeException("Access Denied.");
            }

            if (pendingUser.getRole() != Role.DEPARTMENT_HEAD) {
                throw new RuntimeException("Access Denied.");
            }

            pendingUser.setIsActive(true);
            return userRepo.save(pendingUser);
        }

        if (loggedUser.getRole() == Role.DEPARTMENT_HEAD) {

            if (!loggedUser.getDepartment().equals(pendingUser.getDepartment())) {
                throw new RuntimeException("Access Denied.");
            }

            if (pendingUser.getRole() != Role.LAB_MANAGER
                    && pendingUser.getRole() != Role.LAB_TECHNICIAN) {

                throw new RuntimeException("Access Denied.");
            }

            pendingUser.setIsActive(true);
            return userRepo.save(pendingUser);
        }

        throw new RuntimeException("Access Denied.");
    }

}
