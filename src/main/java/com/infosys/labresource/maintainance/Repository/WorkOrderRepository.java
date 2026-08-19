package com.infosys.labresource.maintainance.Repository;

import com.infosys.labresource.maintainance.Entities.WorkOrder;
import com.infosys.labresource.maintainance.Entities.orderStatus;
import com.infosys.labresource.user.entites.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder,Long> {
    List<WorkOrder> findByAssignedTechnician(UserEntity technician);

    List<WorkOrder> findByAssignedTechnicianId(Long technicianId);

    List<WorkOrder> findByStatus(orderStatus status);

    Optional<WorkOrder> findByMaintenanceScheduleScheduleId(Long scheduleId);
}
