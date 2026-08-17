package com.labplatform.maintenance.dto;

import jakarta.validation.constraints.NotBlank;

public class WorkOrderCompleteRequest {

    @NotBlank(message = "Service log is required")
    private String serviceLog;

    public WorkOrderCompleteRequest() {
    }

    public String getServiceLog() {
        return serviceLog;
    }

    public void setServiceLog(String serviceLog) {
        this.serviceLog = serviceLog;
    }
}