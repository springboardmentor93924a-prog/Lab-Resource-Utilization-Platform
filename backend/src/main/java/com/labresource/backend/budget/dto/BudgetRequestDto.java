package com.labresource.backend.budget.dto;

import com.labresource.backend.budget.entity.BudgetRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequestDto {
    private Long requestId;
    private Long departmentId;
    private String departmentName;
    private Long institutionId;
    private String fiscalYear;
    private BigDecimal requestedAmount;
    private String reason;
    private String status;
    private Long requestedBy;
    private String requestedByName;
    private Long reviewedBy;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String reviewComment;
    private LocalDateTime createdAt;

    public static BudgetRequestDto fromEntity(BudgetRequest request, String departmentName, String requestedByName, String reviewedByName) {
        return new BudgetRequestDto(
                request.getRequestId(),
                request.getDepartmentId(),
                departmentName,
                request.getInstitutionId(),
                request.getFiscalYear(),
                request.getRequestedAmount(),
                request.getReason(),
                request.getStatus(),
                request.getRequestedBy(),
                requestedByName,
                request.getReviewedBy(),
                reviewedByName,
                request.getReviewedAt(),
                request.getReviewComment(),
                request.getCreatedAt()
        );
    }
}
