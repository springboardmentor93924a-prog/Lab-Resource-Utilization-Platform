package com.labresource.backend.institution.controller;

import com.labresource.backend.institution.dto.InstitutionBankAccountDto;
import com.labresource.backend.institution.entity.InstitutionBankAccount;
import com.labresource.backend.institution.service.InstitutionBankAccountService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institution/bank-account")
@RequiredArgsConstructor
public class InstitutionBankAccountController {

    private final InstitutionBankAccountService bankAccountService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<InstitutionBankAccountDto> getBankAccounts(@AuthenticationPrincipal UserPrincipal principal) {
        return bankAccountService.getBankAccounts(principal);
    }

    @GetMapping("/primary")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public InstitutionBankAccountDto getPrimaryBankAccount(@AuthenticationPrincipal UserPrincipal principal) {
        return bankAccountService.getPrimaryBankAccount(principal);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public InstitutionBankAccountDto addBankAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody InstitutionBankAccount account) {
        return bankAccountService.addBankAccount(principal, account);
    }
}
