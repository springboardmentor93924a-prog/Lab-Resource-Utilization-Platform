package com.infosys.labresource.maintainance.Repository;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.maintainance.Entities.MaintenanceRequest;
import com.infosys.labresource.maintainance.Entities.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<MaintenanceRequest,Long> {
    List<MaintenanceRequest> findByEquipment(Equipment equipment);

    List<MaintenanceRequest> findByStatus(RequestStatus status);

    List<MaintenanceRequest> findByRequestedByUserId(Long userId);
}
