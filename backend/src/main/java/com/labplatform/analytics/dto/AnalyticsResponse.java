package com.labplatform.analytics.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsResponse {

    private String viewType; // "RESEARCHER", "ADMIN", or "SYSTEM"


    // =========================================================
    // RESEARCHER FIELDS
    // =========================================================

    private Integer myTotalBookings;

    private Integer myTotalUsageHours;

    private List<Map<String, Object>> myFavoriteEquipment;

    /*
     * Recent equipment usage history.
     *
     * Each item contains:
     * id
     * equipmentName
     * bookingDate
     * durationHours
     * purpose
     * status
     */
    private List<Map<String, Object>> myUsageHistory;


    // =========================================================
    // ADMIN FIELDS
    // =========================================================

    private Integer institutionTotalEquipment;

    private Integer institutionTotalBookings;

    private Double institutionAvgUtilization;

    private List<Map<String, Object>> institutionTopEquipment;

    private Integer institutionOpenWorkOrders;


    // =========================================================
    // BOOKING / NO-SHOW ANALYTICS
    // =========================================================

    private Integer institutionConfirmedBookings;

    private Integer institutionCompletedBookings;

    private Integer institutionCancelledBookings;

    private Integer institutionNoShowBookings;

    private Double institutionNoShowRate;

    private Double institutionCompletionRate;


    // =========================================================
    // SYSTEM-WIDE FIELDS
    // =========================================================

    private Integer systemTotalInstitutions;

    private Integer systemTotalEquipment;

    private Integer systemTotalBookings;

    private Integer systemCrossInstitutionBookings;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AnalyticsResponse() {
    }


    // =========================================================
    // VIEW TYPE
    // =========================================================

    public String getViewType() {
        return viewType;
    }

    public void setViewType(String viewType) {
        this.viewType = viewType;
    }


    // =========================================================
    // RESEARCHER
    // =========================================================

    public Integer getMyTotalBookings() {
        return myTotalBookings;
    }

    public void setMyTotalBookings(Integer myTotalBookings) {
        this.myTotalBookings = myTotalBookings;
    }


    public Integer getMyTotalUsageHours() {
        return myTotalUsageHours;
    }

    public void setMyTotalUsageHours(Integer myTotalUsageHours) {
        this.myTotalUsageHours = myTotalUsageHours;
    }


    public List<Map<String, Object>> getMyFavoriteEquipment() {
        return myFavoriteEquipment;
    }

    public void setMyFavoriteEquipment(
            List<Map<String, Object>> myFavoriteEquipment) {

        this.myFavoriteEquipment = myFavoriteEquipment;
    }


    // =========================================================
    // USAGE HISTORY
    // =========================================================

    public List<Map<String, Object>> getMyUsageHistory() {
        return myUsageHistory;
    }

    public void setMyUsageHistory(
            List<Map<String, Object>> myUsageHistory) {

        this.myUsageHistory = myUsageHistory;
    }


    // =========================================================
    // ADMIN
    // =========================================================

    public Integer getInstitutionTotalEquipment() {
        return institutionTotalEquipment;
    }

    public void setInstitutionTotalEquipment(
            Integer institutionTotalEquipment) {

        this.institutionTotalEquipment =
                institutionTotalEquipment;
    }


    public Integer getInstitutionTotalBookings() {
        return institutionTotalBookings;
    }

    public void setInstitutionTotalBookings(
            Integer institutionTotalBookings) {

        this.institutionTotalBookings =
                institutionTotalBookings;
    }


    public Double getInstitutionAvgUtilization() {
        return institutionAvgUtilization;
    }

    public void setInstitutionAvgUtilization(
            Double institutionAvgUtilization) {

        this.institutionAvgUtilization =
                institutionAvgUtilization;
    }


    public List<Map<String, Object>> getInstitutionTopEquipment() {
        return institutionTopEquipment;
    }

    public void setInstitutionTopEquipment(
            List<Map<String, Object>> institutionTopEquipment) {

        this.institutionTopEquipment =
                institutionTopEquipment;
    }


    public Integer getInstitutionOpenWorkOrders() {
        return institutionOpenWorkOrders;
    }

    public void setInstitutionOpenWorkOrders(
            Integer institutionOpenWorkOrders) {

        this.institutionOpenWorkOrders =
                institutionOpenWorkOrders;
    }


    // =========================================================
    // BOOKING / NO-SHOW ANALYTICS
    // =========================================================

    public Integer getInstitutionConfirmedBookings() {
        return institutionConfirmedBookings;
    }

    public void setInstitutionConfirmedBookings(
            Integer institutionConfirmedBookings) {

        this.institutionConfirmedBookings =
                institutionConfirmedBookings;
    }


    public Integer getInstitutionCompletedBookings() {
        return institutionCompletedBookings;
    }

    public void setInstitutionCompletedBookings(
            Integer institutionCompletedBookings) {

        this.institutionCompletedBookings =
                institutionCompletedBookings;
    }


    public Integer getInstitutionCancelledBookings() {
        return institutionCancelledBookings;
    }

    public void setInstitutionCancelledBookings(
            Integer institutionCancelledBookings) {

        this.institutionCancelledBookings =
                institutionCancelledBookings;
    }


    public Integer getInstitutionNoShowBookings() {
        return institutionNoShowBookings;
    }

    public void setInstitutionNoShowBookings(
            Integer institutionNoShowBookings) {

        this.institutionNoShowBookings =
                institutionNoShowBookings;
    }


    public Double getInstitutionNoShowRate() {
        return institutionNoShowRate;
    }

    public void setInstitutionNoShowRate(
            Double institutionNoShowRate) {

        this.institutionNoShowRate =
                institutionNoShowRate;
    }


    public Double getInstitutionCompletionRate() {
        return institutionCompletionRate;
    }

    public void setInstitutionCompletionRate(
            Double institutionCompletionRate) {

        this.institutionCompletionRate =
                institutionCompletionRate;
    }


    // =========================================================
    // SYSTEM
    // =========================================================

    public Integer getSystemTotalInstitutions() {
        return systemTotalInstitutions;
    }

    public void setSystemTotalInstitutions(
            Integer systemTotalInstitutions) {

        this.systemTotalInstitutions =
                systemTotalInstitutions;
    }


    public Integer getSystemTotalEquipment() {
        return systemTotalEquipment;
    }

    public void setSystemTotalEquipment(
            Integer systemTotalEquipment) {

        this.systemTotalEquipment =
                systemTotalEquipment;
    }


    public Integer getSystemTotalBookings() {
        return systemTotalBookings;
    }

    public void setSystemTotalBookings(
            Integer systemTotalBookings) {

        this.systemTotalBookings =
                systemTotalBookings;
    }


    public Integer getSystemCrossInstitutionBookings() {
        return systemCrossInstitutionBookings;
    }

    public void setSystemCrossInstitutionBookings(
            Integer systemCrossInstitutionBookings) {

        this.systemCrossInstitutionBookings =
                systemCrossInstitutionBookings;
    }
}