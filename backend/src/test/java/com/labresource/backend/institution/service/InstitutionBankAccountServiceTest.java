package com.labresource.backend.institution.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.institution.dto.InstitutionBankAccountDto;
import com.labresource.backend.institution.entity.InstitutionBankAccount;
import com.labresource.backend.institution.repository.InstitutionBankAccountRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InstitutionBankAccountServiceTest {

    @Mock
    private InstitutionBankAccountRepository bankAccountRepository;

    @InjectMocks
    private InstitutionBankAccountService bankAccountService;

    @Test
    public void getPrimaryBankAccount_MasksAccountNumber() {
        AppUser user = new AppUser();
        user.setUserId(99L);
        user.setInstitutionId(100L);
        user.setIsActive(true);

        Role role = new Role();
        role.setRoleName("ROLE_INSTITUTION_ADMIN");
        user.setRoles(Set.of(role));

        UserPrincipal admin = new UserPrincipal(user);

        InstitutionBankAccount acc = new InstitutionBankAccount();
        acc.setBankAccountId(1L);
        acc.setInstitutionId(100L);
        acc.setAccountHolderName("PSG College of Technology");
        acc.setBankName("State Bank of India");
        acc.setAccountNumber("98765432101234");
        acc.setIfscCode("SBIN0001234");
        acc.setIsPrimary(true);

        when(bankAccountRepository.findByInstitutionIdAndIsPrimaryTrue(100L)).thenReturn(Optional.of(acc));

        InstitutionBankAccountDto dto = bankAccountService.getPrimaryBankAccount(admin);

        assertNotNull(dto);
        assertEquals("XXXX XXXX 1234", dto.getMaskedAccountNumber());
        assertEquals("State Bank of India", dto.getBankName());
    }
}
