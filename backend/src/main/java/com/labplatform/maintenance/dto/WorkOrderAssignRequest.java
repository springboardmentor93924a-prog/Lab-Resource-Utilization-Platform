package com.labplatform.maintenance.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class WorkOrderAssignRequest {

    @NotNull(message = "Technician user id is required")
    private UUID technicianUserId;

    public UUID getTechnicianUserId() { return technicianUserId; }
    public void setTechnicianUserId(UUID technicianUserId) { this.technicianUserId = technicianUserId; }
}