package com.labresource.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionStaffRosterDto {
    private Long institutionId;
    private String institutionName;
    private String institutionCode;

    private int totalStaffCount;
    private int activeCount;
    private int pendingCount;
    private int inactiveCount;

    private int departmentHeadCount;
    private int labManagerCount;
    private int technicianCount;

    @Builder.Default
    private List<DepartmentStaffGroupDto> departments = new ArrayList<>();

    @Builder.Default
    private List<StaffMemberDto> allStaff = new ArrayList<>();
}
