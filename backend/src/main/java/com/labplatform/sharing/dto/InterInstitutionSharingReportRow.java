package com.labplatform.sharing.dto;

public class InterInstitutionSharingReportRow {

    private Integer requestingInstitutionId;
    private String requestingInstitutionName;

    private Integer owningInstitutionId;
    private String owningInstitutionName;

    private Long totalRequests;
    private Long approvedRequests;
    private Long rejectedRequests;
    private Long pendingRequests;

    private Long sharedEquipment;

    public InterInstitutionSharingReportRow() {
    }

    public InterInstitutionSharingReportRow(
            Integer requestingInstitutionId,
            String requestingInstitutionName,
            Integer owningInstitutionId,
            String owningInstitutionName,
            Long totalRequests,
            Long approvedRequests,
            Long rejectedRequests,
            Long pendingRequests,
            Long sharedEquipment) {

        this.requestingInstitutionId = requestingInstitutionId;
        this.requestingInstitutionName = requestingInstitutionName;
        this.owningInstitutionId = owningInstitutionId;
        this.owningInstitutionName = owningInstitutionName;
        this.totalRequests = totalRequests;
        this.approvedRequests = approvedRequests;
        this.rejectedRequests = rejectedRequests;
        this.pendingRequests = pendingRequests;
        this.sharedEquipment = sharedEquipment;
    }

    public Integer getRequestingInstitutionId() {
        return requestingInstitutionId;
    }

    public void setRequestingInstitutionId(Integer requestingInstitutionId) {
        this.requestingInstitutionId = requestingInstitutionId;
    }

    public String getRequestingInstitutionName() {
        return requestingInstitutionName;
    }

    public void setRequestingInstitutionName(String requestingInstitutionName) {
        this.requestingInstitutionName = requestingInstitutionName;
    }

    public Integer getOwningInstitutionId() {
        return owningInstitutionId;
    }

    public void setOwningInstitutionId(Integer owningInstitutionId) {
        this.owningInstitutionId = owningInstitutionId;
    }

    public String getOwningInstitutionName() {
        return owningInstitutionName;
    }

    public void setOwningInstitutionName(String owningInstitutionName) {
        this.owningInstitutionName = owningInstitutionName;
    }

    public Long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(Long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public Long getApprovedRequests() {
        return approvedRequests;
    }

    public void setApprovedRequests(Long approvedRequests) {
        this.approvedRequests = approvedRequests;
    }

    public Long getRejectedRequests() {
        return rejectedRequests;
    }

    public void setRejectedRequests(Long rejectedRequests) {
        this.rejectedRequests = rejectedRequests;
    }

    public Long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(Long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public Long getSharedEquipment() {
        return sharedEquipment;
    }

    public void setSharedEquipment(Long sharedEquipment) {
        this.sharedEquipment = sharedEquipment;
    }
}