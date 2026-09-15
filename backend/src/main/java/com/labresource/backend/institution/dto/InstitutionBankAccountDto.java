package com.labresource.backend.institution.dto;

import com.labresource.backend.institution.entity.InstitutionBankAccount;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionBankAccountDto {
    private Long bankAccountId;
    private Long institutionId;
    private String accountHolderName;
    private String bankName;
    private String maskedAccountNumber;
    private String ifscCode;
    private String accountType;
    private Boolean isPrimary;
    private Boolean isVerified;

    public static InstitutionBankAccountDto fromEntity(InstitutionBankAccount account) {
        String raw = account.getAccountNumber() != null ? account.getAccountNumber() : "";
        String masked = raw.length() > 4 ? "XXXX XXXX " + raw.substring(raw.length() - 4) : "XXXX XXXX " + raw;

        return new InstitutionBankAccountDto(
                account.getBankAccountId(),
                account.getInstitutionId(),
                account.getAccountHolderName(),
                account.getBankName(),
                masked,
                account.getIfscCode(),
                account.getAccountType(),
                account.getIsPrimary(),
                account.getIsVerified()
        );
    }
}
