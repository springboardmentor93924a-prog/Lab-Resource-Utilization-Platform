package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.DTOs.LoginRequestDTO;
import com.infosys.labresource.user.DTOs.RegisterRequestDTO;
import com.infosys.labresource.user.Repository.DepartmentRepo;
import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    private final UserRepository userRepo;
    private final InstitutionRepo institutionRepo;
    private final DepartmentRepo departRepo;
    private final PasswordEncoder passwordEncoder;
    @Override
    public Institution createInstitution(Institution institution) {
        return institutionRepo.save(institution);
    }

    @Override
    public Department createDepartment(Department department) {
        return departRepo.save(department);
    }

    @Override
    public UserEntity registerUser(RegisterRequestDTO req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }
        Institution institution = institutionRepo.findById(req.getInstitutionId())
                .orElseThrow(() -> new RuntimeException("Institution not found."));

        Department department = departRepo.findById(req.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found."));

        UserEntity user = new UserEntity();

        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(req.getRole());
        user.setInstitution(institution);
        user.setDepartment(department);
        user.setIsActive(true);

        return userRepo.save(user);
    }

    @Override
    public UserEntity loginUser(LoginRequestDTO req) {
        UserEntity user = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found with this email."));

        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password.");
        }

        return user;
    }
}
