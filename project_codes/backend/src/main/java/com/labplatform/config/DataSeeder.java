package com.labplatform.config;

import com.labplatform.entity.*;
import com.labplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds a demo institution, one user per role, and a couple of equipment items
 * so the app is immediately explorable after first startup.
 * All demo accounts use the password: Password123!
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (institutionRepository.count() > 0) return; // already seeded

        Institution institution = institutionRepository.save(Institution.builder()
                .name("Nova Institute of Technology")
                .address("123 Research Park")
                .city("Bengaluru").country("India")
                .contactEmail("admin@novainstitute.edu")
                .build());

        String pwd = passwordEncoder.encode("Password123!");

        userRepository.save(User.builder().fullName("Riya Researcher").email("researcher@demo.com")
                .passwordHash(pwd).role(Role.RESEARCHER).department("Chemistry").institution(institution).build());

        userRepository.save(User.builder().fullName("Tom Technician").email("technician@demo.com")
                .passwordHash(pwd).role(Role.LAB_TECHNICIAN).department("Facilities").institution(institution).build());

        userRepository.save(User.builder().fullName("Maya Manager").email("manager@demo.com")
                .passwordHash(pwd).role(Role.LAB_MANAGER).department("Chemistry").institution(institution).build());

        userRepository.save(User.builder().fullName("Dev Head").email("depthead@demo.com")
                .passwordHash(pwd).role(Role.DEPARTMENT_HEAD).department("Chemistry").institution(institution).build());

        userRepository.save(User.builder().fullName("Ana Admin").email("instadmin@demo.com")
                .passwordHash(pwd).role(Role.INSTITUTION_ADMIN).institution(institution).build());

        userRepository.save(User.builder().fullName("Sam SysAdmin").email("sysadmin@demo.com")
                .passwordHash(pwd).role(Role.SYSTEM_ADMIN).build());

        equipmentRepository.save(Equipment.builder()
                .name("Mass Spectrometer MS-4000").category("Spectrometer")
                .tags("chemistry,analysis,shared")
                .specifications("High-resolution mass spectrometer for compound analysis")
                .institution(institution).department("Chemistry")
                .status(EquipmentStatus.AVAILABLE)
                .sharableAcrossInstitutions(true)
                .hourlyUsageCost(new BigDecimal("45.00"))
                .purchaseDate(LocalDate.of(2023, 3, 10))
                .purchaseCost(new BigDecimal("120000"))
                .lastCalibrationDate(LocalDate.now().minusMonths(2))
                .nextCalibrationDue(LocalDate.now().plusMonths(4))
                .build());

        equipmentRepository.save(Equipment.builder()
                .name("Confocal Microscope CM-200").category("Microscope")
                .tags("biology,imaging")
                .specifications("Laser scanning confocal microscope, 4-channel")
                .institution(institution).department("Biology")
                .status(EquipmentStatus.AVAILABLE)
                .sharableAcrossInstitutions(false)
                .hourlyUsageCost(new BigDecimal("30.00"))
                .purchaseDate(LocalDate.of(2022, 8, 1))
                .purchaseCost(new BigDecimal("85000"))
                .lastCalibrationDate(LocalDate.now().minusMonths(1))
                .nextCalibrationDue(LocalDate.now().plusDays(20))
                .build());

        System.out.println("=== Demo data seeded ===");
        System.out.println("Login with any of: researcher@demo.com / technician@demo.com / manager@demo.com /");
        System.out.println("depthead@demo.com / instadmin@demo.com / sysadmin@demo.com");
        System.out.println("Password for all: Password123!");
    }
}
