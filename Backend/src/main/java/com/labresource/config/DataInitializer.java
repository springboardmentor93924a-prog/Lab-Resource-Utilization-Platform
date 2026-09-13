package com.labresource.config;

import com.labresource.entity.Institution;
import com.labresource.repository.InstitutionRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeInstitutions(
            InstitutionRepository institutionRepository
    ) {

        return args -> {

            if (institutionRepository.count() == 0) {

                institutionRepository.save(
                        new Institution(
                                "Government College of Engineering",
                                "College Campus",
                                "Pune",
                                "Maharashtra",
                                "India",
                                "contact@gcoepune.edu.in",
                                "02012345678",
                                true
                        )
                );

                institutionRepository.save(
                        new Institution(
                                "MIT World Peace University",
                                "Kothrud",
                                "Pune",
                                "Maharashtra",
                                "India",
                                "contact@mitwpu.edu.in",
                                "02012345679",
                                true
                        )
                );

                institutionRepository.save(
                        new Institution(
                                "Pune Institute of Computer Technology",
                                "Dhankawadi",
                                "Pune",
                                "Maharashtra",
                                "India",
                                "contact@pict.edu.in",
                                "02012345680",
                                true
                        )
                );

                institutionRepository.save(
                        new Institution(
                                "Savitribai Phule Pune University",
                                "Ganeshkhind",
                                "Pune",
                                "Maharashtra",
                                "India",
                                "contact@unipune.ac.in",
                                "02012345681",
                                true
                        )
                );

                System.out.println(
                        "Default institutions inserted successfully."
                );

            } else {

                System.out.println(
                        "Institutions already exist. Skipping initialization."
                );
            }
        };
    }
}