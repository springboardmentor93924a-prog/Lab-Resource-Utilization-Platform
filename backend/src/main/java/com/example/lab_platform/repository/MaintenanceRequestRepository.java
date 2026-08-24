 package com.example.lab_platform.repository;

import com.example.lab_platform.entity.MaintenanceRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository
        extends JpaRepository<MaintenanceRequest, Integer> {

    List<MaintenanceRequest> findByRequestStatus(
            String requestStatus
    );

    List<MaintenanceRequest> findByEquipment_EquipmentId(
            Integer equipmentId
    );

    List<MaintenanceRequest> findByRequestedBy_UserId(
            Integer userId
    );
}