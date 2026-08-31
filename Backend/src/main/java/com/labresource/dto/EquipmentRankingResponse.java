package com.labresource.dto;

public class EquipmentRankingResponse {

    private Long equipmentId;
    private String equipmentName;
    private String assetTag;
    private double utilizationPercentage;
    private int rank;

    public EquipmentRankingResponse() {
    }

    public EquipmentRankingResponse(
            Long equipmentId,
            String equipmentName,
            String assetTag,
            double utilizationPercentage,
            int rank) {

        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.assetTag = assetTag;
        this.utilizationPercentage = utilizationPercentage;
        this.rank = rank;
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

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(
            double utilizationPercentage) {

        this.utilizationPercentage =
                utilizationPercentage;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }
}