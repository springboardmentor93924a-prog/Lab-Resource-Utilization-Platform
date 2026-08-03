package com.labresource.dto.department;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private String id;

    private String name;

    private String description;

    private String institutionId;

    private String institutionName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}