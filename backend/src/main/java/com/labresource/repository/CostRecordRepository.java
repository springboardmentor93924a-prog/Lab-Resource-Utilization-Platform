package com.labresource.repository;

import com.labresource.entity.CalibrationRecord;
import com.labresource.entity.CostRecord;
import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.entity.MaintenanceRecord;
import com.labresource.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CostRecordRepository
        extends JpaRepository<CostRecord, String> {

    List<CostRecord> findByEquipment(
            Equipment equipment
    );

    List<CostRecord> findByInstitution(
            Institution institution
    );

    List<CostRecord> findByMaintenanceRecord(
            MaintenanceRecord maintenanceRecord
    );

    List<CostRecord> findByCalibrationRecord(
            CalibrationRecord calibrationRecord
    );

    List<CostRecord> findByCreatedBy(
            User createdBy
    );

    List<CostRecord> findByCostTypeIgnoreCase(
            String costType
    );

    List<CostRecord> findByPaymentStatusIgnoreCase(
            String paymentStatus
    );

    List<CostRecord> findByInstitutionAndCostTypeIgnoreCase(
            Institution institution,
            String costType
    );

    List<CostRecord> findByEquipmentAndCostTypeIgnoreCase(
            Equipment equipment,
            String costType
    );

    List<CostRecord> findByCostDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<CostRecord> findByInstitutionAndCostDateBetween(
            Institution institution,
            LocalDate startDate,
            LocalDate endDate
    );

    List<CostRecord> findByEquipmentAndCostDateBetween(
            Equipment equipment,
            LocalDate startDate,
            LocalDate endDate
    );

    List<CostRecord> findByInstitutionAndPaymentStatusIgnoreCase(
            Institution institution,
            String paymentStatus
    );

    boolean existsByInvoiceNumberIgnoreCase(
            String invoiceNumber
    );
}