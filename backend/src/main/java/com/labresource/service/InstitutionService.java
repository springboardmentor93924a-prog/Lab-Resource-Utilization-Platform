package com.labresource.service;

import com.labresource.dto.institution.InstitutionRequest;
import com.labresource.dto.institution.InstitutionResponse;

import java.util.List;

public interface InstitutionService {

    InstitutionResponse createInstitution(
            InstitutionRequest request
    );

    List<InstitutionResponse> getAllInstitutions();

    InstitutionResponse getInstitutionById(
            String institutionId
    );

    InstitutionResponse updateInstitution(
            String institutionId,
            InstitutionRequest request
    );

    void deleteInstitution(
            String institutionId
    );
}