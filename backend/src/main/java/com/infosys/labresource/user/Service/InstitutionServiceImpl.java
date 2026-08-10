package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionServiceImpl implements InstitutionService{
    private final InstitutionRepo institutionRepo;
    private final UserRepository userRepo;

    @Override
    public Institution createInstitution(Institution institution,
                                         Authentication authentication) {

        UserEntity loggedInUser = userRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (loggedInUser.getRole() != Role.SYSTEM_ADMIN) {
            throw new RuntimeException("Only System Administrator can create institutions.");
        }

        if (institutionRepo.existsByInstitutionCode(institution.getInstitutionCode())) {
            throw new RuntimeException("Institution Code already exists.");
        }

        if (institutionRepo.existsByInstitutionName(institution.getInstitutionName())) {
            throw new RuntimeException("Institution Name already exists.");
        }

        return institutionRepo.save(institution);
    }

    @Override
    public List<Institution> getAllInstitutions() {
        return institutionRepo.findAll();
    }

    @Override
    public Institution getInstitutionByCode(String code) {

        return institutionRepo.findByInstitutionCode(code)
                .orElseThrow(() ->
                        new RuntimeException("Institution not found."));
    }

    @Override
    public Institution getInstitutionByName(String name) {

        return institutionRepo.findByInstitutionName(name)
                .orElseThrow(() ->
                        new RuntimeException("Institution not found."));
    }

    @Override
    public List<Institution> getInstitutionsByCity(String city) {

        return institutionRepo.findByCity(city);
    }

    @Override
    public Institution updateInstitution(Long institutionId,
                                         Institution request,
                                         Authentication authentication) {

        UserEntity loggedInUser = userRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found."));

        Institution institution = institutionRepo.findById(institutionId)
                .orElseThrow(() ->
                        new RuntimeException("Institution not found."));

        switch (loggedInUser.getRole()) {

            case SYSTEM_ADMIN:
                break;

            case INSTITUTION_ADMIN:

                if (!loggedInUser.getInstitution().getInstitutionId()
                        .equals(institution.getInstitutionId())) {

                    throw new RuntimeException("Access Denied.");
                }

                break;

            default:
                throw new RuntimeException("Access Denied.");
        }

        institution.setInstitutionName(request.getInstitutionName());
        institution.setAddress(request.getAddress());
        institution.setCity(request.getCity());
        institution.setState(request.getState());
        institution.setCountry(request.getCountry());
        institution.setPincode(request.getPincode());
        institution.setContactEmail(request.getContactEmail());

        return institutionRepo.save(institution);
    }

    @Override
    public void deleteInstitution(Long institutionId,
                                  Authentication authentication) {

        UserEntity loggedInUser = userRepo.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        if (loggedInUser.getRole() != Role.SYSTEM_ADMIN) {
            throw new RuntimeException("Only System Administrator can delete institutions.");
        }

        Institution institution = institutionRepo.findById(institutionId)
                .orElseThrow(() ->
                        new RuntimeException("Institution not found."));

        institutionRepo.delete(institution);
    }
}
