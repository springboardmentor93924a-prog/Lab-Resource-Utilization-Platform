package com.labresource.service.impl;

import com.labresource.dto.BillingRecordResponseDto;
import com.labresource.dto.CostRecordResponseDto;
import com.labresource.dto.ReportResponseDto;
import com.labresource.dto.booking.BookingResponse;
import com.labresource.dto.calibration.CalibrationResponse;
import com.labresource.dto.equipment.EquipmentResponse;
import com.labresource.dto.institution.InstitutionResponse;
import com.labresource.dto.maintenance.MaintenanceResponse;

import com.labresource.entity.BillingRecord;
import com.labresource.entity.Booking;
import com.labresource.entity.CalibrationRecord;
import com.labresource.entity.CostRecord;
import com.labresource.entity.Equipment;
import com.labresource.entity.MaintenanceRecord;

import com.labresource.repository.BillingRecordRepository;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.CalibrationRecordRepository;
import com.labresource.repository.CostRecordRepository;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.ExternalBookingRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.MaintenanceRecordRepository;
import com.labresource.repository.ResourceSharingRequestRepository;
import com.labresource.repository.UserRepository;

import com.labresource.service.BillingRecordService;
import com.labresource.service.BookingService;
import com.labresource.service.CalibrationService;
import com.labresource.service.CostRecordService;
import com.labresource.service.EquipmentService;
import com.labresource.service.InstitutionService;
import com.labresource.service.MaintenanceService;
import com.labresource.service.ReportService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final EquipmentService equipmentService;
    private final BookingService bookingService;
    private final MaintenanceService maintenanceService;
    private final CalibrationService calibrationService;
    private final CostRecordService costRecordService;
    private final BillingRecordService billingRecordService;
    private final InstitutionService institutionService;

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final CalibrationRecordRepository calibrationRecordRepository;
    private final CostRecordRepository costRecordRepository;
    private final BillingRecordRepository billingRecordRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ExternalBookingRepository externalBookingRepository;
    private final ResourceSharingRequestRepository resourceSharingRequestRepository;

    public ReportServiceImpl(
            EquipmentService equipmentService,
            BookingService bookingService,
            MaintenanceService maintenanceService,
            CalibrationService calibrationService,
            CostRecordService costRecordService,
            BillingRecordService billingRecordService,
            InstitutionService institutionService,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            MaintenanceRecordRepository maintenanceRecordRepository,
            CalibrationRecordRepository calibrationRecordRepository,
            CostRecordRepository costRecordRepository,
            BillingRecordRepository billingRecordRepository,
            InstitutionRepository institutionRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            ExternalBookingRepository externalBookingRepository,
            ResourceSharingRequestRepository resourceSharingRequestRepository
    ) {
        this.equipmentService = equipmentService;
        this.bookingService = bookingService;
        this.maintenanceService = maintenanceService;
        this.calibrationService = calibrationService;
        this.costRecordService = costRecordService;
        this.billingRecordService = billingRecordService;
        this.institutionService = institutionService;

        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.calibrationRecordRepository = calibrationRecordRepository;
        this.costRecordRepository = costRecordRepository;
        this.billingRecordRepository = billingRecordRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.externalBookingRepository = externalBookingRepository;
        this.resourceSharingRequestRepository =
                resourceSharingRequestRepository;
    }

    @Override
    public List<EquipmentResponse> getEquipmentReport() {
        return equipmentService.getAllEquipment();
    }

    @Override
    public List<BookingResponse> getBookingReport() {
        return bookingService.getAllBookings();
    }

    @Override
    public List<MaintenanceResponse> getMaintenanceReport() {
        return maintenanceService.getAllMaintenanceRecords();
    }

    @Override
    public List<CalibrationResponse> getCalibrationReport() {
        return calibrationService.getAllCalibrationRecords();
    }

    @Override
    public List<CostRecordResponseDto> getCostReport() {
        return costRecordService.getAllCostRecords();
    }

    @Override
    public List<BillingRecordResponseDto> getBillingReport() {
        return billingRecordService.getAllBillingRecords();
    }

    @Override
    public List<InstitutionResponse> getInstitutionReport() {
        return institutionService.getAllInstitutions();
    }

    @Override
    public ReportResponseDto getDashboardSummary() {

        ReportResponseDto response =
                createEmptyReport("DASHBOARD_SUMMARY");

        fillEquipmentSummary(response);
        fillBookingSummary(response);
        fillMaintenanceSummary(response);
        fillCalibrationSummary(response);
        fillBasicCounts(response);
        fillBillingSummary(response);
        fillFinancialSummary(response);

        return response;
    }

    @Override
    public ReportResponseDto getRevenueSummary() {

        ReportResponseDto response =
                createEmptyReport("REVENUE_SUMMARY");

        fillBillingSummary(response);
        fillFinancialSummary(response);

        return response;
    }

    private ReportResponseDto createEmptyReport(String reportType) {

        ReportResponseDto response =
                new ReportResponseDto();

        response.setReportType(reportType);
        response.setGeneratedAt(LocalDateTime.now());
        response.setTotalRevenue(BigDecimal.ZERO);
        response.setTotalCost(BigDecimal.ZERO);
        response.setProfit(BigDecimal.ZERO);

        return response;
    }

    private void fillEquipmentSummary(
            ReportResponseDto response
    ) {

        List<Equipment> equipmentList =
                equipmentRepository.findAll();

        response.setTotalEquipments(equipmentList.size());

        response.setAvailableEquipments(
                countEquipmentByStatus(
                        equipmentList,
                        "AVAILABLE"
                )
        );

        response.setBookedEquipments(
                countEquipmentByStatus(
                        equipmentList,
                        "BOOKED"
                )
        );

        response.setMaintenanceEquipments(
                countEquipmentByStatus(
                        equipmentList,
                        "MAINTENANCE"
                )
        );

        response.setUnavailableEquipments(
                countEquipmentByStatus(
                        equipmentList,
                        "UNAVAILABLE"
                )
        );
    }

    private void fillBookingSummary(
            ReportResponseDto response
    ) {

        List<Booking> bookingList =
                bookingRepository.findAll();

        response.setTotalBookings(bookingList.size());

        response.setApprovedBookings(
                countBookingByStatus(
                        bookingList,
                        "APPROVED"
                )
        );

        response.setPendingBookings(
                countBookingByStatus(
                        bookingList,
                        "PENDING"
                )
        );

        response.setRejectedBookings(
                countBookingByStatus(
                        bookingList,
                        "REJECTED"
                )
        );

        response.setCancelledBookings(
                countBookingByStatus(
                        bookingList,
                        "CANCELLED"
                )
        );

        response.setCompletedBookings(
                countBookingByStatus(
                        bookingList,
                        "COMPLETED"
                )
        );
    }

    private void fillMaintenanceSummary(
            ReportResponseDto response
    ) {

        List<MaintenanceRecord> recordList =
                maintenanceRecordRepository.findAll();

        response.setTotalMaintenanceRecords(
                recordList.size()
        );

        response.setPendingMaintenanceRecords(
                countMaintenanceByStatus(
                        recordList,
                        "PENDING"
                )
        );

        response.setCompletedMaintenanceRecords(
                countMaintenanceByStatus(
                        recordList,
                        "COMPLETED"
                )
        );
    }

    private void fillCalibrationSummary(
            ReportResponseDto response
    ) {

        List<CalibrationRecord> recordList =
                calibrationRecordRepository.findAll();

        response.setTotalCalibrationRecords(
                recordList.size()
        );

        response.setPendingCalibrationRecords(
                countCalibrationByStatus(
                        recordList,
                        "PENDING"
                )
        );

        response.setCompletedCalibrationRecords(
                countCalibrationByStatus(
                        recordList,
                        "COMPLETED"
                )
        );
    }

    private void fillBasicCounts(
            ReportResponseDto response
    ) {

        response.setTotalInstitutions(
                institutionRepository.count()
        );

        response.setTotalDepartments(
                departmentRepository.count()
        );

        response.setTotalUsers(
                userRepository.count()
        );

        response.setTotalExternalBookings(
                externalBookingRepository.count()
        );

        response.setTotalResourceSharingRequests(
                resourceSharingRequestRepository.count()
        );
    }

    private long countEquipmentByStatus(
            List<Equipment> equipmentList,
            String requiredStatus
    ) {

        return equipmentList.stream()
                .filter(equipment ->
                        statusMatches(
                                equipment.getStatus(),
                                requiredStatus
                        )
                )
                .count();
    }

    private long countBookingByStatus(
            List<Booking> bookingList,
            String requiredStatus
    ) {

        return bookingList.stream()
                .filter(booking ->
                        statusMatches(
                                booking.getApprovalStatus(),
                                requiredStatus
                        )
                )
                .count();
    }

    private long countMaintenanceByStatus(
            List<MaintenanceRecord> recordList,
            String requiredStatus
    ) {

        return recordList.stream()
                .filter(record ->
                        statusMatches(
                                record.getStatus(),
                                requiredStatus
                        )
                )
                .count();
    }

    private long countCalibrationByStatus(
            List<CalibrationRecord> recordList,
            String requiredStatus
    ) {

        return recordList.stream()
                .filter(record ->
                        statusMatches(
                                record.getStatus(),
                                requiredStatus
                        )
                )
                .count();
    }

    private boolean statusMatches(
            Object actualStatus,
            String requiredStatus
    ) {

        if (actualStatus == null ||
                requiredStatus == null) {
            return false;
        }

        return requiredStatus.equalsIgnoreCase(
                actualStatus.toString()
        );
    }

    private void fillBillingSummary(
            ReportResponseDto response
    ) {

        List<BillingRecord> billingRecords =
                billingRecordRepository.findAll();

        response.setTotalBills(billingRecords.size());

        response.setPaidBills(
                countBillsByPaymentStatus(
                        billingRecords,
                        "PAID"
                )
        );

        response.setPendingBills(
                countBillsByPaymentStatus(
                        billingRecords,
                        "PENDING"
                )
        );

        long statusOverdueCount =
                countBillsByPaymentStatus(
                        billingRecords,
                        "OVERDUE"
                );

        long dateOverdueCount =
                billingRecords.stream()
                        .filter(this::isPendingAndPastDue)
                        .count();

        response.setOverdueBills(
                Math.max(
                        statusOverdueCount,
                        dateOverdueCount
                )
        );
    }

    private long countBillsByPaymentStatus(
            List<BillingRecord> billingRecords,
            String requiredStatus
    ) {

        return billingRecords.stream()
                .filter(record ->
                        statusMatches(
                                record.getPaymentStatus(),
                                requiredStatus
                        )
                )
                .count();
    }

    private boolean isPendingAndPastDue(
            BillingRecord billingRecord
    ) {

        if (billingRecord == null ||
                billingRecord.getDueDate() == null) {
            return false;
        }

        boolean isPending =
                statusMatches(
                        billingRecord.getPaymentStatus(),
                        "PENDING"
                );

        boolean isPastDue =
                billingRecord.getDueDate()
                        .isBefore(LocalDate.now());

        return isPending && isPastDue;
    }

    private void fillFinancialSummary(
            ReportResponseDto response
    ) {

        BigDecimal revenue =
                calculateTotalRevenue();

        BigDecimal cost =
                calculateTotalCost();

        BigDecimal profit =
                revenue.subtract(cost);

        response.setTotalRevenue(revenue);
        response.setTotalCost(cost);
        response.setProfit(profit);
    }

    private BigDecimal calculateTotalRevenue() {

        return billingRecordRepository.findAll()
                .stream()
                .filter(record ->
                        statusMatches(
                                record.getPaymentStatus(),
                                "PAID"
                        )
                )
                .map(BillingRecord::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    private BigDecimal calculateTotalCost() {

        return costRecordRepository.findAll()
                .stream()
                .map(CostRecord::getAmount)
                .filter(amount -> amount != null)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }
}