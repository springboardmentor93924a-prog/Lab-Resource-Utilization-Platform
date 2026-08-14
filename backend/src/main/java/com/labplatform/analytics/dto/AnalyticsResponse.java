package com.labplatform.analytics.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsResponse {

    private String viewType; // "RESEARCHER", "ADMIN", or "SYSTEM"

    // Researcher fields
    private Integer myTotalBookings;
    private Integer myTotalUsageHours;
    private List<Map<String, Object>> myFavoriteEquipment;

    // Admin fields
    private Integer institutionTotalEquipment;
    private Integer institutionTotalBookings;
    private Double institutionAvgUtilization;
    private List<Map<String, Object>> institutionTopEquipment;
    private Integer institutionOpenWorkOrders;

    // System-wide fields
    private Integer systemTotalInstitutions;
    private Integer systemTotalEquipment;
    private Integer systemTotalBookings;
    private Integer systemCrossInstitutionBookings;

    public AnalyticsResponse() {
    }

    public String getViewType() { return viewType; }
    public void setViewType(String viewType) { this.viewType = viewType; }

    public Integer getMyTotalBookings() { return myTotalBookings; }
    public void setMyTotalBookings(Integer myTotalBookings) { this.myTotalBookings = myTotalBookings; }

    public Integer getMyTotalUsageHours() { return myTotalUsageHours; }
    public void setMyTotalUsageHours(Integer myTotalUsageHours) { this.myTotalUsageHours = myTotalUsageHours; }

    public List<Map<String, Object>> getMyFavoriteEquipment() { return myFavoriteEquipment; }
    public void setMyFavoriteEquipment(List<Map<String, Object>> myFavoriteEquipment) { this.myFavoriteEquipment = myFavoriteEquipment; }

    public Integer getInstitutionTotalEquipment() { return institutionTotalEquipment; }
    public void setInstitutionTotalEquipment(Integer institutionTotalEquipment) { this.institutionTotalEquipment = institutionTotalEquipment; }

    public Integer getInstitutionTotalBookings() { return institutionTotalBookings; }
    public void setInstitutionTotalBookings(Integer institutionTotalBookings) { this.institutionTotalBookings = institutionTotalBookings; }

    public Double getInstitutionAvgUtilization() { return institutionAvgUtilization; }
    public void setInstitutionAvgUtilization(Double institutionAvgUtilization) { this.institutionAvgUtilization = institutionAvgUtilization; }

    public List<Map<String, Object>> getInstitutionTopEquipment() { return institutionTopEquipment; }
    public void setInstitutionTopEquipment(List<Map<String, Object>> institutionTopEquipment) { this.institutionTopEquipment = institutionTopEquipment; }

    public Integer getInstitutionOpenWorkOrders() { return institutionOpenWorkOrders; }
    public void setInstitutionOpenWorkOrders(Integer institutionOpenWorkOrders) { this.institutionOpenWorkOrders = institutionOpenWorkOrders; }

    public Integer getSystemTotalInstitutions() { return systemTotalInstitutions; }
    public void setSystemTotalInstitutions(Integer systemTotalInstitutions) { this.systemTotalInstitutions = systemTotalInstitutions; }

    public Integer getSystemTotalEquipment() { return systemTotalEquipment; }
    public void setSystemTotalEquipment(Integer systemTotalEquipment) { this.systemTotalEquipment = systemTotalEquipment; }

    public Integer getSystemTotalBookings() { return systemTotalBookings; }
    public void setSystemTotalBookings(Integer systemTotalBookings) { this.systemTotalBookings = systemTotalBookings; }

    public Integer getSystemCrossInstitutionBookings() { return systemCrossInstitutionBookings; }
    public void setSystemCrossInstitutionBookings(Integer systemCrossInstitutionBookings) { this.systemCrossInstitutionBookings = systemCrossInstitutionBookings; }
}