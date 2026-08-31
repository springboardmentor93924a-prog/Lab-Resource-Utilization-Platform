package com.example.lab_platform.dto;

import java.time.LocalDateTime;

public class SharingReportRowDTO {

    private Long requestId;
    private String equipmentName;
    private String requestingInstitution;
    private String providingInstitution;
    private LocalDateTime requestDate;
    private String status;

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getRequestingInstitution() {
        return requestingInstitution;
    }

    public void setRequestingInstitution(String requestingInstitution) {
        this.requestingInstitution = requestingInstitution;
    }

    public String getProvidingInstitution() {
        return providingInstitution;
    }

    public void setProvidingInstitution(String providingInstitution) {
        this.providingInstitution = providingInstitution;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
