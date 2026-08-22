package com.labplatform.analytics.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsResponse {

    private String viewType;
    // RESEARCHER, ADMIN, INSTITUTION_ADMIN, or SYSTEM


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
    // LAB MANAGER / DEPARTMENT HEAD FIELDS
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
    // INSTITUTION ADMINISTRATOR
    // =========================================================

    /*
     * Organization-wide utilization
     */

    private Integer organizationTotalEquipment;

    private Integer organizationTotalBookings;

    private Integer organizationTotalUsageHours;

    private Double organizationAvgUtilization;


    /*
     * Resource sharing
     */

    private Integer organizationCrossInstitutionBookings;

    private Integer organizationSharedResourceCount;


    /*
     * Cost analysis
     */

    private Double organizationTotalPurchaseCost;

    private Double organizationEstimatedUsageValue;

    private Double organizationAverageEquipmentCost;


    /*
     * Procurement insights
     */

    private Integer organizationEquipmentWithPurchaseData;

    private Integer organizationEquipmentWithoutPurchaseData;

    private List<Map<String, Object>> organizationTopSuppliers;

    private List<Map<String, Object>> organizationRecentPurchases;


    /*
     * Equipment lifecycle
     */

    private Integer organizationActiveEquipment;

    private Integer organizationOldEquipment;

    private Integer organizationVeryOldEquipment;

    private List<Map<String, Object>> organizationLifecycleEquipment;


    /*
     * ROI metrics
     */

    private Double organizationEstimatedROI;

    private List<Map<String, Object>> organizationTopROIEquipment;

    // =========================================================
// INSTITUTION ADMIN ANALYTICS
// =========================================================

    private Integer institutionSharingRequests;

    private Integer institutionApprovedSharingRequests;

    private Integer institutionPendingSharingRequests;

    private Integer institutionRejectedSharingRequests;

    private Double institutionTotalPurchaseCost;

    private Double institutionEstimatedUsageValue;

    private Double institutionEstimatedRoi;

    private Double institutionAverageEquipmentAgeYears;

    private Integer institutionLifecycleReviewEquipment;

    private Integer institutionCalibrationDueSoon;

    private Integer institutionCertificationExpiringSoon;
    public Integer getInstitutionSharingRequests() {
        return institutionSharingRequests;
    }

    public void setInstitutionSharingRequests(
            Integer institutionSharingRequests) {

        this.institutionSharingRequests =
                institutionSharingRequests;
    }


    public Integer getInstitutionApprovedSharingRequests() {
        return institutionApprovedSharingRequests;
    }

    public void setInstitutionApprovedSharingRequests(
            Integer institutionApprovedSharingRequests) {

        this.institutionApprovedSharingRequests =
                institutionApprovedSharingRequests;
    }


    public Integer getInstitutionPendingSharingRequests() {
        return institutionPendingSharingRequests;
    }

    public void setInstitutionPendingSharingRequests(
            Integer institutionPendingSharingRequests) {

        this.institutionPendingSharingRequests =
                institutionPendingSharingRequests;
    }


    public Integer getInstitutionRejectedSharingRequests() {
        return institutionRejectedSharingRequests;
    }

    public void setInstitutionRejectedSharingRequests(
            Integer institutionRejectedSharingRequests) {

        this.institutionRejectedSharingRequests =
                institutionRejectedSharingRequests;
    }


    public Double getInstitutionTotalPurchaseCost() {
        return institutionTotalPurchaseCost;
    }

    public void setInstitutionTotalPurchaseCost(
            Double institutionTotalPurchaseCost) {

        this.institutionTotalPurchaseCost =
                institutionTotalPurchaseCost;
    }


    public Double getInstitutionEstimatedUsageValue() {
        return institutionEstimatedUsageValue;
    }

    public void setInstitutionEstimatedUsageValue(
            Double institutionEstimatedUsageValue) {

        this.institutionEstimatedUsageValue =
                institutionEstimatedUsageValue;
    }


    public Double getInstitutionEstimatedRoi() {
        return institutionEstimatedRoi;
    }

    public void setInstitutionEstimatedRoi(
            Double institutionEstimatedRoi) {

        this.institutionEstimatedRoi =
                institutionEstimatedRoi;
    }


    public Double getInstitutionAverageEquipmentAgeYears() {
        return institutionAverageEquipmentAgeYears;
    }

    public void setInstitutionAverageEquipmentAgeYears(
            Double institutionAverageEquipmentAgeYears) {

        this.institutionAverageEquipmentAgeYears =
                institutionAverageEquipmentAgeYears;
    }


    public Integer getInstitutionLifecycleReviewEquipment() {
        return institutionLifecycleReviewEquipment;
    }

    public void setInstitutionLifecycleReviewEquipment(
            Integer institutionLifecycleReviewEquipment) {

        this.institutionLifecycleReviewEquipment =
                institutionLifecycleReviewEquipment;
    }


    public Integer getInstitutionCalibrationDueSoon() {
        return institutionCalibrationDueSoon;
    }

    public void setInstitutionCalibrationDueSoon(
            Integer institutionCalibrationDueSoon) {

        this.institutionCalibrationDueSoon =
                institutionCalibrationDueSoon;
    }


    public Integer getInstitutionCertificationExpiringSoon() {
        return institutionCertificationExpiringSoon;
    }

    public void setInstitutionCertificationExpiringSoon(
            Integer institutionCertificationExpiringSoon) {

        this.institutionCertificationExpiringSoon =
                institutionCertificationExpiringSoon;
    }


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
    // ADMIN / LAB MANAGER
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
    // INSTITUTION ADMINISTRATOR
    // =========================================================

    // ---------------------------------------------------------
    // ORGANIZATION UTILIZATION
    // ---------------------------------------------------------

    public Integer getOrganizationTotalEquipment() {
        return organizationTotalEquipment;
    }

    public void setOrganizationTotalEquipment(
            Integer organizationTotalEquipment) {

        this.organizationTotalEquipment =
                organizationTotalEquipment;
    }


    public Integer getOrganizationTotalBookings() {
        return organizationTotalBookings;
    }

    public void setOrganizationTotalBookings(
            Integer organizationTotalBookings) {

        this.organizationTotalBookings =
                organizationTotalBookings;
    }


    public Integer getOrganizationTotalUsageHours() {
        return organizationTotalUsageHours;
    }

    public void setOrganizationTotalUsageHours(
            Integer organizationTotalUsageHours) {

        this.organizationTotalUsageHours =
                organizationTotalUsageHours;
    }


    public Double getOrganizationAvgUtilization() {
        return organizationAvgUtilization;
    }

    public void setOrganizationAvgUtilization(
            Double organizationAvgUtilization) {

        this.organizationAvgUtilization =
                organizationAvgUtilization;
    }


    // ---------------------------------------------------------
    // RESOURCE SHARING
    // ---------------------------------------------------------

    public Integer getOrganizationCrossInstitutionBookings() {
        return organizationCrossInstitutionBookings;
    }

    public void setOrganizationCrossInstitutionBookings(
            Integer organizationCrossInstitutionBookings) {

        this.organizationCrossInstitutionBookings =
                organizationCrossInstitutionBookings;
    }


    public Integer getOrganizationSharedResourceCount() {
        return organizationSharedResourceCount;
    }

    public void setOrganizationSharedResourceCount(
            Integer organizationSharedResourceCount) {

        this.organizationSharedResourceCount =
                organizationSharedResourceCount;
    }


    // ---------------------------------------------------------
    // COST ANALYSIS
    // ---------------------------------------------------------

    public Double getOrganizationTotalPurchaseCost() {
        return organizationTotalPurchaseCost;
    }

    public void setOrganizationTotalPurchaseCost(
            Double organizationTotalPurchaseCost) {

        this.organizationTotalPurchaseCost =
                organizationTotalPurchaseCost;
    }


    public Double getOrganizationEstimatedUsageValue() {
        return organizationEstimatedUsageValue;
    }

    public void setOrganizationEstimatedUsageValue(
            Double organizationEstimatedUsageValue) {

        this.organizationEstimatedUsageValue =
                organizationEstimatedUsageValue;
    }


    public Double getOrganizationAverageEquipmentCost() {
        return organizationAverageEquipmentCost;
    }

    public void setOrganizationAverageEquipmentCost(
            Double organizationAverageEquipmentCost) {

        this.organizationAverageEquipmentCost =
                organizationAverageEquipmentCost;
    }


    // ---------------------------------------------------------
    // PROCUREMENT
    // ---------------------------------------------------------

    public Integer getOrganizationEquipmentWithPurchaseData() {
        return organizationEquipmentWithPurchaseData;
    }

    public void setOrganizationEquipmentWithPurchaseData(
            Integer organizationEquipmentWithPurchaseData) {

        this.organizationEquipmentWithPurchaseData =
                organizationEquipmentWithPurchaseData;
    }


    public Integer getOrganizationEquipmentWithoutPurchaseData() {
        return organizationEquipmentWithoutPurchaseData;
    }

    public void setOrganizationEquipmentWithoutPurchaseData(
            Integer organizationEquipmentWithoutPurchaseData) {

        this.organizationEquipmentWithoutPurchaseData =
                organizationEquipmentWithoutPurchaseData;
    }


    public List<Map<String, Object>> getOrganizationTopSuppliers() {
        return organizationTopSuppliers;
    }

    public void setOrganizationTopSuppliers(
            List<Map<String, Object>> organizationTopSuppliers) {

        this.organizationTopSuppliers =
                organizationTopSuppliers;
    }


    public List<Map<String, Object>> getOrganizationRecentPurchases() {
        return organizationRecentPurchases;
    }

    public void setOrganizationRecentPurchases(
            List<Map<String, Object>> organizationRecentPurchases) {

        this.organizationRecentPurchases =
                organizationRecentPurchases;
    }


    // ---------------------------------------------------------
    // EQUIPMENT LIFECYCLE
    // ---------------------------------------------------------

    public Integer getOrganizationActiveEquipment() {
        return organizationActiveEquipment;
    }

    public void setOrganizationActiveEquipment(
            Integer organizationActiveEquipment) {

        this.organizationActiveEquipment =
                organizationActiveEquipment;
    }


    public Integer getOrganizationOldEquipment() {
        return organizationOldEquipment;
    }

    public void setOrganizationOldEquipment(
            Integer organizationOldEquipment) {

        this.organizationOldEquipment =
                organizationOldEquipment;
    }


    public Integer getOrganizationVeryOldEquipment() {
        return organizationVeryOldEquipment;
    }

    public void setOrganizationVeryOldEquipment(
            Integer organizationVeryOldEquipment) {

        this.organizationVeryOldEquipment =
                organizationVeryOldEquipment;
    }


    public List<Map<String, Object>> getOrganizationLifecycleEquipment() {
        return organizationLifecycleEquipment;
    }

    public void setOrganizationLifecycleEquipment(
            List<Map<String, Object>> organizationLifecycleEquipment) {

        this.organizationLifecycleEquipment =
                organizationLifecycleEquipment;
    }


    // ---------------------------------------------------------
    // ROI
    // ---------------------------------------------------------

    public Double getOrganizationEstimatedROI() {
        return organizationEstimatedROI;
    }

    public void setOrganizationEstimatedROI(
            Double organizationEstimatedROI) {

        this.organizationEstimatedROI =
                organizationEstimatedROI;
    }


    public List<Map<String, Object>> getOrganizationTopROIEquipment() {
        return organizationTopROIEquipment;
    }

    public void setOrganizationTopROIEquipment(
            List<Map<String, Object>> organizationTopROIEquipment) {

        this.organizationTopROIEquipment =
                organizationTopROIEquipment;
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