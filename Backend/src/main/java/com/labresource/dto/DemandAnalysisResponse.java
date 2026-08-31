package com.labresource.dto;

public class DemandAnalysisResponse {

    private Long equipmentId;
    private String equipmentName;
    private String assetTag;
    private long bookingCount;
    private String demandLevel;

    public DemandAnalysisResponse() {
    }

    public DemandAnalysisResponse(
            Long equipmentId,
            String equipmentName,
            String assetTag,
            long bookingCount,
            String demandLevel) {

        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.assetTag = assetTag;
        this.bookingCount = bookingCount;
        this.demandLevel = demandLevel;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getAssetTag() {
        return assetTag;
    }

    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public String getDemandLevel() {
        return demandLevel;
    }

    public void setDemandLevel(String demandLevel) {
        this.demandLevel = demandLevel;
    }
}