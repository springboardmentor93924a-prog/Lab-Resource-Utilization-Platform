
package com.labresource.repository;

import com.labresource.entity.MaintenanceRequest;
import com.labresource.entity.MaintenanceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRequestRepository
        extends JpaRepository<MaintenanceRequest, Long> {

    // Find requests by status
    List<MaintenanceRequest> findByStatus(
            MaintenanceRequestStatus status
    );

    // Find requests for a particular equipment
    List<MaintenanceRequest> findByEquipmentId(
            Long equipmentId
    );

    // Find requests created by a particular user
    List<MaintenanceRequest> findByRequestedById(
            Long userId
    );

    // Find requests ordered from newest to oldest
    List<MaintenanceRequest> findAllByOrderByRequestedAtDesc();

    // Find requests for equipment ordered from newest to oldest
    List<MaintenanceRequest> findByEquipmentIdOrderByRequestedAtDesc(
            Long equipmentId
    );
}
