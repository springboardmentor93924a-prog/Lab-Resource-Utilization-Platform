package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByEquipmentIdAndStatusNot(Long equipmentId, String status);
    List<MaintenanceRequest> findByRequestedByOrderByCreatedAtDesc(Long userId);
    List<MaintenanceRequest> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    List<MaintenanceRequest> findByAssignedTechnicianIdAndStatusIn(Long technicianId, List<String> statuses);
    List<MaintenanceRequest> findByAssignedTechnicianId(Long technicianId);

    List<MaintenanceRequest> findByEquipmentIdInAndCreatedAtBetween(List<Long> equipmentIds, java.time.LocalDateTime start, java.time.LocalDateTime end);

    List<MaintenanceRequest> findByEquipmentIdIn(List<Long> equipmentIds);

    @org.springframework.data.jpa.repository.Query("SELECT m.equipmentId, COUNT(m) FROM MaintenanceRequest m GROUP BY m.equipmentId")
    List<Object[]> countByEquipmentIdGrouped();
}

