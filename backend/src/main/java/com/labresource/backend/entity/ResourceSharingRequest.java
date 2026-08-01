package com.labresource.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "resource_sharing_requests")
public class ResourceSharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "requesting_institution_id", nullable = false)
    private Long requestingInstitutionId;

    @Column(name = "providing_institution_id", nullable = false)
    private Long providingInstitutionId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;

    @Column(name = "request_date", nullable = false)
    private String requestDate;

    @Column(name = "required_from", nullable = false)
    private String requiredFrom;

    @Column(name = "required_to", nullable = false)
    private String requiredTo;

    @Column(name = "purpose", length = 255)
    private String purpose;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approval_date")
    private String approvalDate;

    @Column(name = "remarks", length = 255)
    private String remarks;

    // Default Constructor
    public ResourceSharingRequest() {
    }

    // Parameterized Constructor
    public ResourceSharingRequest(Long requestId,
                                  Long requestingInstitutionId,
                                  Long providingInstitutionId,
                                  Long equipmentId,
                                  Long requestedBy,
                                  String requestDate,
                                  String requiredFrom,
                                  String requiredTo,
                                  String purpose,
                                  String status,
                                  Long approvedBy,
                                  String approvalDate,
                                  String remarks) {

        this.requestId = requestId;
        this.requestingInstitutionId = requestingInstitutionId;
        this.providingInstitutionId = providingInstitutionId;
        this.equipmentId = equipmentId;
        this.requestedBy = requestedBy;
        this.requestDate = requestDate;
        this.requiredFrom = requiredFrom;
        this.requiredTo = requiredTo;
        this.purpose = purpose;
        this.status = status;
        this.approvedBy = approvedBy;
        this.approvalDate = approvalDate;
        this.remarks = remarks;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getRequestingInstitutionId() {
        return requestingInstitutionId;
    }

    public void setRequestingInstitutionId(Long requestingInstitutionId) {
        this.requestingInstitutionId = requestingInstitutionId;
    }

    public Long getProvidingInstitutionId() {
        return providingInstitutionId;
    }

    public void setProvidingInstitutionId(Long providingInstitutionId) {
        this.providingInstitutionId = providingInstitutionId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Long getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(Long requestedBy) {
        this.requestedBy = requestedBy;
    }

    public String getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(String requestDate) {
        this.requestDate = requestDate;
    }

    public String getRequiredFrom() {
        return requiredFrom;
    }

    public void setRequiredFrom(String requiredFrom) {
        this.requiredFrom = requiredFrom;
    }

    public String getRequiredTo() {
        return requiredTo;
    }

    public void setRequiredTo(String requiredTo) {
        this.requiredTo = requiredTo;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getApprovalDate() {
        return approvalDate;
    }

    public void setApprovalDate(String approvalDate) {
        this.approvalDate = approvalDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}