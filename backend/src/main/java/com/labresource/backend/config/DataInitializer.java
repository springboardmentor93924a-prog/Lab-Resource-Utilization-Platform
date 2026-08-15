package com.labresource.backend.config;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking database data initialization status...");

        // 1. Seed Roles
        List<String> roleNames = List.of(
                Role.SYSTEM_ADMIN,
                Role.INSTITUTION_ADMIN,
                Role.DEPARTMENT_HEAD,
                Role.LAB_MANAGER,
                Role.LAB_TECHNICIAN,
                Role.RESEARCHER
        );

        for (String rName : roleNames) {
            if (roleRepository.findByRoleName(rName).isEmpty()) {
                Role r = new Role();
                r.setRoleName(rName);
                roleRepository.save(r);
                log.info("Seeded Role: {}", rName);
            }
        }

        // 2. Seed Default Institution if empty
        if (institutionRepository.count() == 0) {
            Institution inst = new Institution();
            inst.setName("Default Testing Institution");
            inst.setAddress("123 Science Way");
            inst.setCity("Mumbai");
            inst.setState("Maharashtra");
            inst.setCountry("India");
            inst.setContactEmail("info@defaultinst.edu");
            inst.setIsActive(true);
            Institution savedInst = institutionRepository.save(inst);
            log.info("Seeded Default Institution with ID: {}", savedInst.getInstitutionId());

            // 3. Seed Default Department
            Department dept = new Department();
            dept.setInstitutionId(savedInst.getInstitutionId());
            dept.setName("Default Research Lab Department");
            dept.setBudgetAllocated(BigDecimal.valueOf(1000000.00));
            dept.setIsActive(true);
            Department savedDept = departmentRepository.save(dept);
            log.info("Seeded Default Department with ID: {}", savedDept.getDepartmentId());
        }

        // 4. Seed initial System Admin if none exists or activate if deactivated
        String adminEmail = "systemadmin@labresource.com";
        appUserRepository.findByEmail(adminEmail).ifPresentOrElse(
            admin -> {
                if (Boolean.FALSE.equals(admin.getIsActive())) {
                    admin.setIsActive(true);
                    admin.setIsEmailVerified(true);
                    appUserRepository.save(admin);
                    log.info("Activated existing System Administrator account ({})", adminEmail);
                }
            },
            () -> {
                Role sysAdminRole = roleRepository.findByRoleName(Role.SYSTEM_ADMIN).get();
                Institution defaultInst = institutionRepository.findAll().get(0);
                Department defaultDept = departmentRepository.findAll().get(0);

                AppUser admin = new AppUser();
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode("Password123")); // Default password
                admin.setAuthProvider("LOCAL");
                admin.setInstitutionId(defaultInst.getInstitutionId());
                admin.setDepartmentId(defaultDept.getDepartmentId());
                admin.setIsActive(true);
                admin.setIsEmailVerified(true);
                admin.setRoles(new HashSet<>() {{ add(sysAdminRole); }});

                appUserRepository.save(admin);
                log.info("Seeded Default System Administrator account ({} / Password123)", adminEmail);
            }
        );

        log.info("Data initialization check completed successfully.");
    }
}
