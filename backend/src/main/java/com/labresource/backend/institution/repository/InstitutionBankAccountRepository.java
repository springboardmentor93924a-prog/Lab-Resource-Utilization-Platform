package com.labresource.backend.institution.repository;

import com.labresource.backend.institution.entity.InstitutionBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionBankAccountRepository extends JpaRepository<InstitutionBankAccount, Long> {
    List<InstitutionBankAccount> findByInstitutionId(Long institutionId);
    Optional<InstitutionBankAccount> findByInstitutionIdAndIsPrimaryTrue(Long institutionId);
}
