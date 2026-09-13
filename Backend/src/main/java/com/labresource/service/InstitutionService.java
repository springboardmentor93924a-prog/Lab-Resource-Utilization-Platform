package com.labresource.service;

import com.labresource.entity.Institution;
import com.labresource.repository.InstitutionRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    public InstitutionService(
            InstitutionRepository institutionRepository
    ) {
        this.institutionRepository = institutionRepository;
    }

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    public List<Institution> getActiveInstitutions() {
        return institutionRepository.findByActiveTrue();
    }

    public Institution getInstitution(Long id) {

        return institutionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Institution not found"
                        )
                );
    }

    public Institution createInstitution(
            Institution institution
    ) {

        return institutionRepository.save(
                institution
        );
    }

    public Institution updateInstitution(
            Long id,
            Institution updatedInstitution
    ) {

        Institution institution =
                getInstitution(id);

        institution.setName(
                updatedInstitution.getName()
        );

        institution.setAddress(
                updatedInstitution.getAddress()
        );

        institution.setCity(
                updatedInstitution.getCity()
        );

        institution.setState(
                updatedInstitution.getState()
        );

        institution.setCountry(
                updatedInstitution.getCountry()
        );

        institution.setContactEmail(
                updatedInstitution.getContactEmail()
        );

        institution.setContactPhone(
                updatedInstitution.getContactPhone()
        );

        institution.setActive(
                updatedInstitution.getActive()
        );

        return institutionRepository.save(
                institution
        );
    }

    public void deleteInstitution(Long id) {

        Institution institution =
                getInstitution(id);

        institution.setActive(false);

        institutionRepository.save(institution);
    }
}