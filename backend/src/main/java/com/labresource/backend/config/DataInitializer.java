package com.labresource.backend.config;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:${app.admin.email:}}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:${app.admin.password:}}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking database data initialization status...");

        // 1. Seed Roles (Reference Configuration)
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

        // 2. Bootstrap System Administrator from environment configuration if provided
        if (adminEmail != null && !adminEmail.isBlank() && adminPassword != null && !adminPassword.isBlank()) {
            final String targetEmail = adminEmail.trim();
            appUserRepository.findByEmail(targetEmail).ifPresentOrElse(
                admin -> {
                    if (Boolean.FALSE.equals(admin.getIsActive())) {
                        admin.setIsActive(true);
                        admin.setIsEmailVerified(true);
                        appUserRepository.save(admin);
                        log.info("Activated existing System Administrator account ({})", targetEmail);
                    }
                },
                () -> {
                    Role sysAdminRole = roleRepository.findByRoleName(Role.SYSTEM_ADMIN).orElse(null);
                    if (sysAdminRole == null) {
                        sysAdminRole = new Role();
                        sysAdminRole.setRoleName(Role.SYSTEM_ADMIN);
                        sysAdminRole = roleRepository.save(sysAdminRole);
                    }

                    AppUser admin = new AppUser();
                    admin.setFirstName("System");
                    admin.setLastName("Administrator");
                    admin.setEmail(targetEmail);
                    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                    admin.setAuthProvider("LOCAL");
                    admin.setInstitutionId(null);
                    admin.setDepartmentId(null);
                    admin.setIsActive(true);
                    admin.setIsEmailVerified(true);
                    final Role roleToAssign = sysAdminRole;
                    admin.setRoles(new HashSet<>() {{ add(roleToAssign); }});

                    appUserRepository.save(admin);
                    log.info("Bootstrapped System Administrator account from environment configuration ({})", targetEmail);
                }
            );
        } else {
            log.info("No ADMIN_EMAIL / ADMIN_PASSWORD configured. Skipping System Administrator bootstrapping.");
        }

        log.info("Data initialization check completed successfully.");
    }
}
