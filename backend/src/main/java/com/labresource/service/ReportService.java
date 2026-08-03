package com.labresource.service;

import com.labresource.dto.BillingRecordResponseDto;
import com.labresource.dto.CostRecordResponseDto;
import com.labresource.dto.ReportResponseDto;
import com.labresource.dto.booking.BookingResponse;
import com.labresource.dto.calibration.CalibrationResponse;
import com.labresource.dto.equipment.EquipmentResponse;
import com.labresource.dto.institution.InstitutionResponse;
import com.labresource.dto.maintenance.MaintenanceResponse;

import java.util.List;

public interface ReportService {

    List<EquipmentResponse> getEquipmentReport();

    List<BookingResponse> getBookingReport();

    List<MaintenanceResponse> getMaintenanceReport();

    List<CalibrationResponse> getCalibrationReport();

    List<CostRecordResponseDto> getCostReport();

    List<BillingRecordResponseDto> getBillingReport();

    List<InstitutionResponse> getInstitutionReport();

    ReportResponseDto getDashboardSummary();

    ReportResponseDto getRevenueSummary();
}