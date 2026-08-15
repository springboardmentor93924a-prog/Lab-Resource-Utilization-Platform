package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByEquipmentIdAndStatusNot(Long equipmentId, String status);
    List<MaintenanceRequest> findByRequestedByOrderByCreatedAtDesc(Long userId);
}
