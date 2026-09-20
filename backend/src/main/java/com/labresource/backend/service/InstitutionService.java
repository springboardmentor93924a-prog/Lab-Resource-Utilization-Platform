package com.labresource.backend.service;

import com.labresource.backend.entity.Institution;
import com.labresource.backend.repository.InstitutionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    public InstitutionService(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    public Institution saveInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    public Institution getInstitutionById(Integer id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
    }

    public Institution updateInstitution(Integer id, Institution institution) {
        Institution existing = getInstitutionById(id);

        existing.setInstitutionName(institution.getInstitutionName());
        existing.setAddress(institution.getAddress());
        existing.setEmail(institution.getEmail());
        existing.setPhone(institution.getPhone());

        return institutionRepository.save(existing);
    }

    public void deleteInstitution(Integer id) {
        institutionRepository.deleteById(id);
    }
}