package com.labresource.backend.laboratory.dto;

import com.labresource.backend.laboratory.entity.Laboratory;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LaboratoryDto {
    private Long labId;
    private Long institutionId;
    private Long departmentId;
    private String departmentName;
    private String name;
    private String description;
    private String location;
    private Integer capacity;
    private String imagePublicId;
    private String imageSecureUrl;
    private String imageFileName;
    private Boolean isActive;

    public static LaboratoryDto fromEntity(Laboratory lab, String departmentName) {
        return new LaboratoryDto(
                lab.getLabId(),
                lab.getInstitutionId(),
                lab.getDepartmentId(),
                departmentName,
                lab.getName(),
                lab.getDescription(),
                lab.getLocation(),
                lab.getCapacity(),
                lab.getImagePublicId(),
                lab.getImageSecureUrl(),
                lab.getImageFileName(),
                lab.getIsActive()
        );
    }
}
