package com.example.lab_platform.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class SharingReportDTO {

    private String reportTitle = "Inter-Institution Sharing Report";
    private LocalDateTime generatedAt;
    private Map<String, String> appliedFilters;

    private long totalRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private long pendingRequests;
    private String mostSharedEquipment;
    private String mostActiveInstitution;

    private List<SharingReportRowDTO> rows;

    public String getReportTitle() {
        return reportTitle;
    }

    public void setReportTitle(String reportTitle) {
        this.reportTitle = reportTitle;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Map<String, String> getAppliedFilters() {
        return appliedFilters;
    }

    public void setAppliedFilters(Map<String, String> appliedFilters) {
        this.appliedFilters = appliedFilters;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getApprovedRequests() {
        return approvedRequests;
    }

    public void setApprovedRequests(long approvedRequests) {
        this.approvedRequests = approvedRequests;
    }

    public long getRejectedRequests() {
        return rejectedRequests;
    }

    public void setRejectedRequests(long rejectedRequests) {
        this.rejectedRequests = rejectedRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public String getMostSharedEquipment() {
        return mostSharedEquipment;
    }

    public void setMostSharedEquipment(String mostSharedEquipment) {
        this.mostSharedEquipment = mostSharedEquipment;
    }

    public String getMostActiveInstitution() {
        return mostActiveInstitution;
    }

    public void setMostActiveInstitution(String mostActiveInstitution) {
        this.mostActiveInstitution = mostActiveInstitution;
    }

    public List<SharingReportRowDTO> getRows() {
        return rows;
    }

    public void setRows(List<SharingReportRowDTO> rows) {
        this.rows = rows;
    }
}
