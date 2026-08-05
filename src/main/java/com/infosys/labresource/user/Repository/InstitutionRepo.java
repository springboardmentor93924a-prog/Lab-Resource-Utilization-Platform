package com.infosys.labresource.user.Repository;

import com.infosys.labresource.user.entites.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionRepo extends JpaRepository<Institution,Long> {
    Optional<Institution> findByInstitutionCode(String institutionCode);

    Optional<Institution> findByInstitutionName(String institutionName);

    List<Institution> findByCity(String city);

    boolean existsByInstitutionCode(String institutionCode);

    boolean existsByInstitutionName(String institutionName);

}
