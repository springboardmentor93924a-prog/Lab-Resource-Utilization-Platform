package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.entites.Institution;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface InstitutionService {
    Institution createInstitution(Institution institution,
                                  Authentication authentication);

    List<Institution> getAllInstitutions();

    Institution getInstitutionByCode(String code);

    Institution getInstitutionByName(String name);

    List<Institution> getInstitutionsByCity(String city);
    Institution updateInstitution(Long institutionId,
                                  Institution request,
                                  Authentication authentication);
    void deleteInstitution(Long institutionId,
                           Authentication authentication);
}
