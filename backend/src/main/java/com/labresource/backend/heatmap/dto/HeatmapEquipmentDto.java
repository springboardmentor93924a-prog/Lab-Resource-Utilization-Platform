package com.labresource.backend.heatmap.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Equipment DTO for the Utilization Heatmap component.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapEquipmentDto {

    private Long id;
    private String name;
    private String status;
    private String department;
    private String category;
    private String labName;
    private String location;
    private Long departmentId;
    private Long labId;
    private Boolean isShareable;

    public HeatmapEquipmentDto(Long id, String name, String status, String department, String category) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.department = department;
        this.category = category;
        this.labName = "General Lab";
        this.location = "";
        this.departmentId = null;
        this.labId = null;
        this.isShareable = false;
    }
}
