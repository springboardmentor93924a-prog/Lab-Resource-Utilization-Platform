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
public class DepartmentStaffGroupDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    private int headCount;
    private int managerCount;
    private int technicianCount;
    private int totalStaffCount;

    @Builder.Default
    private List<StaffMemberDto> staff = new ArrayList<>();
}
