package com.labresource.backend.institution.repository;

import com.labresource.backend.institution.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    boolean existsByCodeIgnoreCase(String code);
    Optional<Institution> findByCodeIgnoreCase(String code);
    List<Institution> findByApprovalStatusIgnoreCaseAndIsActiveTrue(String approvalStatus);
}
