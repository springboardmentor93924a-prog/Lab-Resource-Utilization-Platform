package com.example.lab_platform.service.impl;
 
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.MaintenanceService;
 
import org.springframework.stereotype.Service;
 
import java.util.List;
 
@Service
public class MaintenanceServiceImpl implements MaintenanceService {
 
 
    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
 
 
    public MaintenanceServiceImpl(
            MaintenanceRepository maintenanceRepository,
            EquipmentRepository equipmentRepository) {
 
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
    }
 
 
 
    @Override
    public List<Maintenance> getAllMaintenance() {
 
        return maintenanceRepository.findAll();
    }
 
 
 
    @Override
    public Maintenance getMaintenanceById(Long id) {
 
        return maintenanceRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Maintenance not found"));
    }
 
 
 
    @Override
    public Maintenance createMaintenance(
            Maintenance maintenance) {
 
 
        Equipment equipment =
                maintenance.getEquipment();
 
 
        if(equipment != null) {
 
            equipment.setStatus("Under Maintenance");
 
            equipmentRepository.save(equipment);
        }
 
 
        maintenance.setMaintenanceStatus("Active");
 
 
        return maintenanceRepository.save(maintenance);
    }
 
 
 
    /*
     * Updates an existing maintenance record (type, description,
     * dates, status). When the status is changed to "Completed",
     * the linked equipment is immediately released back to
     * "Available" instead of waiting on the next scheduler pass,
     * unless another still-active maintenance record exists for
     * the same equipment.
     */
    @Override
    public Maintenance updateMaintenance(Long id, Maintenance updatedMaintenance) {
 
        Maintenance existing = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));
 
        if (updatedMaintenance.getMaintenanceType() != null) {
            existing.setMaintenanceType(updatedMaintenance.getMaintenanceType());
        }
 
        if (updatedMaintenance.getDescription() != null) {
            existing.setDescription(updatedMaintenance.getDescription());
        }
 
        if (updatedMaintenance.getMaintenanceDate() != null) {
            existing.setMaintenanceDate(updatedMaintenance.getMaintenanceDate());
        }
 
        if (updatedMaintenance.getNextMaintenanceDate() != null) {
            existing.setNextMaintenanceDate(updatedMaintenance.getNextMaintenanceDate());
        }
 
        if (updatedMaintenance.getMaintenanceStatus() != null) {
            existing.setMaintenanceStatus(updatedMaintenance.getMaintenanceStatus());
        }
 
        Maintenance saved = maintenanceRepository.save(existing);
 
        syncEquipmentStatus(saved);
 
        return saved;
    }
 
    private void syncEquipmentStatus(Maintenance maintenance) {
 
        Equipment equipment = maintenance.getEquipment();
 
        if (equipment == null) {
            return;
        }
 
        String status = maintenance.getMaintenanceStatus();
 
        boolean justCompletedOrCancelled =
                status != null
                        && (status.equalsIgnoreCase("Completed")
                        || status.equalsIgnoreCase("Cancelled"));
 
        if (!justCompletedOrCancelled) {
            equipment.setStatus("Under Maintenance");
            equipmentRepository.save(equipment);
            return;
        }
 
        boolean stillBlocked = maintenanceRepository
                .findByEquipment_EquipmentId(equipment.getEquipmentId())
                .stream()
                .anyMatch(m ->
                        m.getMaintenanceStatus() != null
                                && (m.getMaintenanceStatus().equalsIgnoreCase("Active")
                                || m.getMaintenanceStatus().equalsIgnoreCase("Scheduled")
                                || m.getMaintenanceStatus().equalsIgnoreCase("In Progress")));
 
        if (!stillBlocked) {
            equipment.setStatus("Available");
            equipmentRepository.save(equipment);
        }
    }
 
}