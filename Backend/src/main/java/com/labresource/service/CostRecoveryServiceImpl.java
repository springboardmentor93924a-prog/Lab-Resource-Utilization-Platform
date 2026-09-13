package com.labresource.service.impl;

import com.labresource.entity.ChargebackStatus;
import com.labresource.entity.CostRecovery;
import com.labresource.repository.CostRecoveryRepository;
import com.labresource.service.CostRecoveryService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CostRecoveryServiceImpl
        implements CostRecoveryService {

    private final CostRecoveryRepository recoveryRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CostRecoveryServiceImpl(
            CostRecoveryRepository recoveryRepository
    ) {
        this.recoveryRepository = recoveryRepository;
    }


    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public CostRecovery createRecovery(
            CostRecovery recovery
    ) {

        validateRecovery(recovery);

        if (recovery.getRecoveryDate() == null) {
            recovery.setRecoveryDate(
                    LocalDate.now()
            );
        }

        if (recovery.getRecoverableAmount() == null) {
            recovery.setRecoverableAmount(0.0);
        }

        if (recovery.getRecoveredAmount() == null) {
            recovery.setRecoveredAmount(0.0);
        }

        if (recovery.getOutstandingAmount() == null) {
            recovery.setOutstandingAmount(
                    calculateOutstandingAmount(
                            recovery.getRecoverableAmount(),
                            recovery.getRecoveredAmount()
                    )
            );
        }

        if (recovery.getChargebackStatus() == null) {
            recovery.setChargebackStatus(
                    ChargebackStatus.PENDING
            );
        }

        validateAmounts(
                recovery.getRecoverableAmount(),
                recovery.getRecoveredAmount()
        );

        return recoveryRepository.save(recovery);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public CostRecovery updateRecovery(
            Long id,
            CostRecovery updatedRecovery
    ) {

        CostRecovery existingRecovery =
                getRecoveryById(id);

        validateRecovery(updatedRecovery);

        existingRecovery.setCost(
                updatedRecovery.getCost()
        );

        existingRecovery.setDepartment(
                updatedRecovery.getDepartment()
        );

        existingRecovery.setInstitution(
                updatedRecovery.getInstitution()
        );

        existingRecovery.setEquipment(
                updatedRecovery.getEquipment()
        );

        existingRecovery.setRecoverableAmount(
                updatedRecovery.getRecoverableAmount()
        );

        existingRecovery.setRecoveredAmount(
                updatedRecovery.getRecoveredAmount()
        );

        existingRecovery.setRecoveryDate(
                updatedRecovery.getRecoveryDate()
        );

        existingRecovery.setChargebackStatus(
                updatedRecovery.getChargebackStatus()
        );

        if (existingRecovery.getRecoveryDate() == null) {
            existingRecovery.setRecoveryDate(
                    LocalDate.now()
            );
        }

        if (existingRecovery.getRecoverableAmount() == null) {
            existingRecovery.setRecoverableAmount(0.0);
        }

        if (existingRecovery.getRecoveredAmount() == null) {
            existingRecovery.setRecoveredAmount(0.0);
        }

        if (existingRecovery.getChargebackStatus() == null) {
            existingRecovery.setChargebackStatus(
                    ChargebackStatus.PENDING
            );
        }

        validateAmounts(
                existingRecovery.getRecoverableAmount(),
                existingRecovery.getRecoveredAmount()
        );

        existingRecovery.setOutstandingAmount(
                calculateOutstandingAmount(
                        existingRecovery.getRecoverableAmount(),
                        existingRecovery.getRecoveredAmount()
                )
        );

        return recoveryRepository.save(
                existingRecovery
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CostRecovery getRecoveryById(
            Long id
    ) {

        validateId(
                id,
                "Recovery ID"
        );

        return recoveryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cost recovery record not found with id: "
                                + id
                        )
                );
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getAllRecoveries() {

        return recoveryRepository.findAll();
    }


    // =========================================================
    // GET BY COST
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getRecoveriesByCost(
            Long costId
    ) {

        validateId(
                costId,
                "Cost ID"
        );

        return recoveryRepository.findByCostId(
                costId
        );
    }


    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getRecoveriesByDepartment(
            Long departmentId
    ) {

        validateId(
                departmentId,
                "Department ID"
        );

        return recoveryRepository.findByDepartmentId(
                departmentId
        );
    }


    // =========================================================
    // GET BY INSTITUTION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getRecoveriesByInstitution(
            Long institutionId
    ) {

        validateId(
                institutionId,
                "Institution ID"
        );

        return recoveryRepository.findByInstitutionId(
                institutionId
        );
    }


    // =========================================================
    // GET BY EQUIPMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getRecoveriesByEquipment(
            Long equipmentId
    ) {

        validateId(
                equipmentId,
                "Equipment ID"
        );

        return recoveryRepository.findByEquipmentId(
                equipmentId
        );
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getRecoveriesByStatus(
            ChargebackStatus chargebackStatus
    ) {

        validateStatus(chargebackStatus);

        return recoveryRepository.findByChargebackStatus(
                chargebackStatus
        );
    }


    // =========================================================
    // GET BY RECOVERY DATE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getRecoveriesByDate(
            LocalDate recoveryDate
    ) {

        if (recoveryDate == null) {
            throw new IllegalArgumentException(
                    "Recovery date cannot be null"
            );
        }

        return recoveryRepository.findByRecoveryDate(
                recoveryDate
        );
    }


    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery> getRecoveriesByDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );

        return recoveryRepository
                .findByRecoveryDateBetween(
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // DEPARTMENT + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery>
    getDepartmentRecoveriesByStatus(
            Long departmentId,
            ChargebackStatus chargebackStatus
    ) {

        validateId(
                departmentId,
                "Department ID"
        );

        validateStatus(chargebackStatus);

        return recoveryRepository
                .findByDepartmentIdAndChargebackStatus(
                        departmentId,
                        chargebackStatus
                );
    }


    // =========================================================
    // INSTITUTION + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery>
    getInstitutionRecoveriesByStatus(
            Long institutionId,
            ChargebackStatus chargebackStatus
    ) {

        validateId(
                institutionId,
                "Institution ID"
        );

        validateStatus(chargebackStatus);

        return recoveryRepository
                .findByInstitutionIdAndChargebackStatus(
                        institutionId,
                        chargebackStatus
                );
    }


    // =========================================================
    // EQUIPMENT + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery>
    getEquipmentRecoveriesByStatus(
            Long equipmentId,
            ChargebackStatus chargebackStatus
    ) {

        validateId(
                equipmentId,
                "Equipment ID"
        );

        validateStatus(chargebackStatus);

        return recoveryRepository
                .findByEquipmentIdAndChargebackStatus(
                        equipmentId,
                        chargebackStatus
                );
    }


    // =========================================================
    // DEPARTMENT + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery>
    getDepartmentRecoveriesByDateRange(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateId(
                departmentId,
                "Department ID"
        );

        validateDateRange(
                startDate,
                endDate
        );

        return recoveryRepository
                .findByDepartmentIdAndRecoveryDateBetween(
                        departmentId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // INSTITUTION + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery>
    getInstitutionRecoveriesByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateId(
                institutionId,
                "Institution ID"
        );

        validateDateRange(
                startDate,
                endDate
        );

        return recoveryRepository
                .findByInstitutionIdAndRecoveryDateBetween(
                        institutionId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // STATUS + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CostRecovery>
    getRecoveriesByStatusAndDateRange(
            ChargebackStatus chargebackStatus,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateStatus(chargebackStatus);

        validateDateRange(
                startDate,
                endDate
        );

        return recoveryRepository
                .findByChargebackStatusAndRecoveryDateBetween(
                        chargebackStatus,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // CALCULATE OUTSTANDING AMOUNT
    // =========================================================

    @Override
    public Double calculateOutstandingAmount(
            Double recoverableAmount,
            Double recoveredAmount
    ) {

        validateAmounts(
                recoverableAmount,
                recoveredAmount
        );

        double outstanding =
                recoverableAmount - recoveredAmount;

        if (outstanding < 0) {
            outstanding = 0.0;
        }

        return Math.round(
                outstanding * 100.0
        ) / 100.0;
    }


    // =========================================================
    // CALCULATE OUTSTANDING FOR EXISTING RECORD
    // =========================================================

    @Override
    public Double calculateOutstandingAmount(
            Long id
    ) {

        CostRecovery recovery =
                getRecoveryById(id);

        Double outstanding =
                calculateOutstandingAmount(
                        recovery.getRecoverableAmount(),
                        recovery.getRecoveredAmount()
                );

        recovery.setOutstandingAmount(
                outstanding
        );

        recoveryRepository.save(
                recovery
        );

        return outstanding;
    }


    // =========================================================
    // UPDATE RECOVERED AMOUNT
    // =========================================================

    @Override
    public CostRecovery updateRecoveredAmount(
            Long id,
            Double recoveredAmount
    ) {

        CostRecovery recovery =
                getRecoveryById(id);

        validateRecoveredAmount(
                recoveredAmount,
                recovery.getRecoverableAmount()
        );

        recovery.setRecoveredAmount(
                recoveredAmount
        );

        Double outstanding =
                calculateOutstandingAmount(
                        recovery.getRecoverableAmount(),
                        recoveredAmount
                );

        recovery.setOutstandingAmount(
                outstanding
        );

        if (outstanding == 0.0) {
            recovery.setChargebackStatus(
                    ChargebackStatus.RECOVERED
            );
        }

        return recoveryRepository.save(
                recovery
        );
    }


    // =========================================================
    // UPDATE CHARGEBACK STATUS
    // =========================================================

    @Override
    public CostRecovery updateChargebackStatus(
            Long id,
            ChargebackStatus chargebackStatus
    ) {

        validateStatus(chargebackStatus);

        CostRecovery recovery =
                getRecoveryById(id);

        recovery.setChargebackStatus(
                chargebackStatus
        );

        return recoveryRepository.save(
                recovery
        );
    }


    // =========================================================
    // MARK AS RECOVERED
    // =========================================================

    @Override
    public CostRecovery markAsRecovered(
            Long id
    ) {

        CostRecovery recovery =
                getRecoveryById(id);

        if (recovery.getRecoverableAmount() == null) {
            throw new IllegalArgumentException(
                    "Recoverable amount cannot be null"
            );
        }

        recovery.setRecoveredAmount(
                recovery.getRecoverableAmount()
        );

        recovery.setOutstandingAmount(
                0.0
        );

        recovery.setChargebackStatus(
                ChargebackStatus.RECOVERED
        );

        return recoveryRepository.save(
                recovery
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteRecovery(
            Long id
    ) {

        CostRecovery recovery =
                getRecoveryById(id);

        recoveryRepository.delete(
                recovery
        );
    }


    // =========================================================
    // VALIDATE RECOVERY
    // =========================================================

    private void validateRecovery(
            CostRecovery recovery
    ) {

        if (recovery == null) {
            throw new IllegalArgumentException(
                    "Recovery data cannot be null"
            );
        }

        if (recovery.getCost() == null) {
            throw new IllegalArgumentException(
                    "Cost is required"
            );
        }

        if (recovery.getDepartment() == null) {
            throw new IllegalArgumentException(
                    "Department is required"
            );
        }

        if (recovery.getInstitution() == null) {
            throw new IllegalArgumentException(
                    "Institution is required"
            );
        }

        if (recovery.getEquipment() == null) {
            throw new IllegalArgumentException(
                    "Equipment is required"
            );
        }
    }


    // =========================================================
    // VALIDATE ID
    // =========================================================

    private void validateId(
            Long id,
            String fieldName
    ) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    fieldName + " must be valid"
            );
        }
    }


    // =========================================================
    // VALIDATE STATUS
    // =========================================================

    private void validateStatus(
            ChargebackStatus chargebackStatus
    ) {

        if (chargebackStatus == null) {
            throw new IllegalArgumentException(
                    "Chargeback status cannot be null"
            );
        }
    }


    // =========================================================
    // VALIDATE AMOUNTS
    // =========================================================

    private void validateAmounts(
            Double recoverableAmount,
            Double recoveredAmount
    ) {

        if (recoverableAmount == null) {
            throw new IllegalArgumentException(
                    "Recoverable amount cannot be null"
            );
        }

        if (recoverableAmount < 0) {
            throw new IllegalArgumentException(
                    "Recoverable amount cannot be negative"
            );
        }

        if (recoveredAmount == null) {
            throw new IllegalArgumentException(
                    "Recovered amount cannot be null"
            );
        }

        if (recoveredAmount < 0) {
            throw new IllegalArgumentException(
                    "Recovered amount cannot be negative"
            );
        }

        if (recoveredAmount > recoverableAmount) {
            throw new IllegalArgumentException(
                    "Recovered amount cannot exceed recoverable amount"
            );
        }
    }


    // =========================================================
    // VALIDATE RECOVERED AMOUNT
    // =========================================================

    private void validateRecoveredAmount(
            Double recoveredAmount,
            Double recoverableAmount
    ) {

        if (recoveredAmount == null) {
            throw new IllegalArgumentException(
                    "Recovered amount cannot be null"
            );
        }

        if (recoveredAmount < 0) {
            throw new IllegalArgumentException(
                    "Recovered amount cannot be negative"
            );
        }

        if (recoverableAmount != null &&
                recoveredAmount > recoverableAmount) {

            throw new IllegalArgumentException(
                    "Recovered amount cannot exceed recoverable amount"
            );
        }
    }


    // =========================================================
    // DATE VALIDATION
    // =========================================================

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null ||
                endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }
    }
}