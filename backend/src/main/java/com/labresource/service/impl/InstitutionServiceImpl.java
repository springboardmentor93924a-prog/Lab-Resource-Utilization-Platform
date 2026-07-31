package com.labresource.service.impl;

import com.labresource.dto.institution.InstitutionRequest;
import com.labresource.dto.institution.InstitutionResponse;
import com.labresource.entity.Institution;
import com.labresource.exception.ResourceNotFoundException;
import com.labresource.repository.InstitutionRepository;
import com.labresource.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionServiceImpl implements InstitutionService {

    private final InstitutionRepository institutionRepository;

    @Override
    public InstitutionResponse createInstitution(InstitutionRequest request) {

        Institution institution = new Institution();

        institution.setName(request.getName());
        institution.setEmail(request.getEmail());
        institution.setPhone(request.getPhone());
        institution.setAddress(request.getAddress());
        institution.setCity(request.getCity());
        institution.setState(request.getState());
        institution.setCountry(request.getCountry());
        institution.setStatus(request.getStatus());

        Institution savedInstitution = institutionRepository.save(institution);

        return mapToResponse(savedInstitution);
    }

    @Override
    public List<InstitutionResponse> getAllInstitutions() {

        return institutionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public InstitutionResponse getInstitutionById(String institutionId) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Institution not found"));

        return mapToResponse(institution);
    }

    @Override
    public InstitutionResponse updateInstitution(
            String institutionId,
            InstitutionRequest request) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Institution not found"));

        institution.setName(request.getName());
        institution.setEmail(request.getEmail());
        institution.setPhone(request.getPhone());
        institution.setAddress(request.getAddress());
        institution.setCity(request.getCity());
        institution.setState(request.getState());
        institution.setCountry(request.getCountry());
        institution.setStatus(request.getStatus());

        Institution updatedInstitution = institutionRepository.save(institution);

        return mapToResponse(updatedInstitution);
    }

    @Override
    public void deleteInstitution(String institutionId) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Institution not found"));

        institutionRepository.delete(institution);
    }

    private InstitutionResponse mapToResponse(Institution institution) {

        return new InstitutionResponse(
                institution.getId(),
                institution.getName(),
                institution.getEmail(),
                institution.getPhone(),
                institution.getAddress(),
                institution.getCity(),
                institution.getState(),
                institution.getCountry(),
                institution.getStatus()
        );
    }
}