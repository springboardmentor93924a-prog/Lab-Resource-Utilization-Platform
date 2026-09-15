package com.labresource.backend.department.dto;

import com.labresource.backend.department.entity.Department;
import com.labresource.backend.laboratory.dto.LaboratoryDto;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class DepartmentDto {
    private Long departmentId;
    private String name;
    private String code;
    private Long institutionId;
    private Long departmentHeadId;
    private BigDecimal budgetAllocated;
    private List<LaboratoryDto> laboratories;

    public static DepartmentDto fromEntity(Department d) {
        return fromEntity(d, null);
    }

    public static DepartmentDto fromEntity(Department d, List<LaboratoryDto> laboratories) {
        if (d == null) return null;
        DepartmentDto dto = new DepartmentDto();
        dto.setDepartmentId(d.getDepartmentId());
        dto.setName(d.getName());
        dto.setCode(d.getCode());
        dto.setInstitutionId(d.getInstitutionId());
        dto.setDepartmentHeadId(d.getDepartmentHeadId());
        dto.setBudgetAllocated(d.getBudgetAllocated());
        dto.setLaboratories(laboratories);
        return dto;
    }
}
