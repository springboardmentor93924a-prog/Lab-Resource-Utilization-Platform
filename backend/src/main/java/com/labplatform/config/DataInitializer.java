package com.labplatform.config;

import com.labplatform.entity.*;
import com.labplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final EquipmentRepository equipmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (institutionRepository.count() == 0) {
                Institution mit = institutionRepository.save(Institution.builder()
                        .name("MIT Research Lab").code("MIT-01").address("Cambridge, MA").contactEmail("lab@mit.edu").build());
                Institution harvard = institutionRepository.save(Institution.builder()
                        .name("Harvard Core Facilities").code("HARV-01").address("Boston, MA").contactEmail("core@harvard.edu").build());

                userRepository.save(User.builder()
                        .email("researcher@university.edu").password(passwordEncoder.encode("password123"))
                        .fullName("Dr. Alan Turing").role(Role.RESEARCHER).department("Biophysics").institution(mit).build());

                userRepository.save(User.builder()
                        .email("manager@university.edu").password(passwordEncoder.encode("password123"))
                        .fullName("Dr. Sarah Connor").role(Role.LAB_MANAGER).department("Biophysics").institution(mit).build());

                userRepository.save(User.builder()
                        .email("admin@university.edu").password(passwordEncoder.encode("password123"))
                        .fullName("Institutional Admin").role(Role.INSTITUTION_ADMIN).department("Administration").institution(mit).build());

                userRepository.save(User.builder()
                        .email("tech@university.edu").password(passwordEncoder.encode("password123"))
                        .fullName("Alex Rivera").role(Role.LAB_TECHNICIAN).department("Engineering").institution(harvard).build());

                equipmentRepository.save(Equipment.builder()
                        .name("Laser Confocal Microscope").category("Imaging").modelNumber("LCM-9000")
                        .status(EquipmentStatus.AVAILABLE).hourlyRate(45.0).allowInterInstitution(true)
                        .department("Biophysics").institution(mit).lastCalibrationDate(LocalDateTime.now().minusMonths(1))
                        .nextCalibrationDueDate(LocalDateTime.now().plusMonths(5)).build());

                equipmentRepository.save(Equipment.builder()
                        .name("500MHz NMR Spectrometer").category("Spectroscopy").modelNumber("NMR-500X")
                        .status(EquipmentStatus.AVAILABLE).hourlyRate(80.0).allowInterInstitution(true)
                        .department("Chemistry").institution(harvard).lastCalibrationDate(LocalDateTime.now().minusMonths(2))
                        .nextCalibrationDueDate(LocalDateTime.now().plusMonths(4)).build());

                equipmentRepository.save(Equipment.builder()
                        .name("Cryo-Electron Microscope").category("Imaging").modelNumber("CRYO-TITAN")
                        .status(EquipmentStatus.UNDER_MAINTENANCE).hourlyRate(150.0).allowInterInstitution(true)
                        .department("Structural Bio").institution(mit).lastCalibrationDate(LocalDateTime.now().minusMonths(6))
                        .nextCalibrationDueDate(LocalDateTime.now().minusDays(2)).build());
            }
        };
    }
}