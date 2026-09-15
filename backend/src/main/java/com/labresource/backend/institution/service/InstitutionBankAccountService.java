package com.labresource.backend.institution.service;

import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.institution.dto.InstitutionBankAccountDto;
import com.labresource.backend.institution.entity.InstitutionBankAccount;
import com.labresource.backend.institution.repository.InstitutionBankAccountRepository;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionBankAccountService {

    private final InstitutionBankAccountRepository bankAccountRepository;

    public List<InstitutionBankAccountDto> getBankAccounts(UserPrincipal principal) {
        return bankAccountRepository.findByInstitutionId(principal.getInstitutionId()).stream()
                .map(InstitutionBankAccountDto::fromEntity)
                .toList();
    }

    public InstitutionBankAccountDto getPrimaryBankAccount(UserPrincipal principal) {
        InstitutionBankAccount account = bankAccountRepository.findByInstitutionIdAndIsPrimaryTrue(principal.getInstitutionId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No primary bank account registered for this institution."));
        return InstitutionBankAccountDto.fromEntity(account);
    }

    @Transactional
    public InstitutionBankAccountDto addBankAccount(UserPrincipal principal, InstitutionBankAccount account) {
        account.setInstitutionId(principal.getInstitutionId());

        if (Boolean.TRUE.equals(account.getIsPrimary())) {
            // Unset previous primary accounts if any
            bankAccountRepository.findByInstitutionId(principal.getInstitutionId()).forEach(a -> {
                a.setIsPrimary(false);
                bankAccountRepository.save(a);
            });
        }

        InstitutionBankAccount saved = bankAccountRepository.save(account);
        return InstitutionBankAccountDto.fromEntity(saved);
    }
}
