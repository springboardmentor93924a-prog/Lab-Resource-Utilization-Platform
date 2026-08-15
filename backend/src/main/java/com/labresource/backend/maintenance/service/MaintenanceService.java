package com.labresource.backend.maintenance.service;

import com.labresource.backend.maintenance.dto.MaintenanceReportDto;
import com.labresource.backend.maintenance.dto.MaintenanceRequestSummaryDto;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.equipment.service.EquipmentService;
import com.labresource.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EquipmentService equipmentService;
    private final NotificationService notificationService;

    @Transactional
    public MaintenanceRequestSummaryDto report(Long userId, MaintenanceReportDto request) {
        Equipment equipment = equipmentService.getEntity(request.getEquipmentId());

        MaintenanceRequest maintenanceRequest = new MaintenanceRequest();
        maintenanceRequest.setEquipmentId(equipment.getEquipmentId());
        maintenanceRequest.setRequestedBy(userId);
        maintenanceRequest.setIssueType(request.getIssueType());
        maintenanceRequest.setIssueDescription(request.getIssueDescription());
        maintenanceRequest.setPriority(request.getPriority() == null || request.getPriority().isBlank()
                ? "MEDIUM" : request.getPriority().toUpperCase());
        maintenanceRequest.setAttachmentSecureUrl(request.getAttachmentUrl());
        maintenanceRequest.setStatus(MaintenanceRequest.OPEN);

        // Save first to obtain the id, then stamp a human-readable ticket code (MR-2026-00045 style).
        MaintenanceRequest saved = maintenanceRequestRepository.save(maintenanceRequest);
        saved.setMaintenanceCode(String.format("MR-%d-%05d", Year.now().getValue(), saved.getMaintenanceId()));
        saved = maintenanceRequestRepository.save(saved);

        notificationService.notifyDepartmentLabManagers(
                equipment.getDepartmentId(),
                "MAINTENANCE_REPORTED",
                "Equipment issue reported: " + equipment.getName(),
                "A " + maintenanceRequest.getPriority().toLowerCase() + " priority issue was reported for \""
                        + equipment.getName() + "\" (" + saved.getMaintenanceCode() + ").");

        return MaintenanceRequestSummaryDto.fromEntity(saved, equipment.getName());
    }

    public List<MaintenanceRequestSummaryDto> myReports(Long userId) {
        return maintenanceRequestRepository.findByRequestedByOrderByCreatedAtDesc(userId).stream()
                .map(m -> MaintenanceRequestSummaryDto.fromEntity(m, equipmentService.getEntity(m.getEquipmentId()).getName()))
                .toList();
    }
}
