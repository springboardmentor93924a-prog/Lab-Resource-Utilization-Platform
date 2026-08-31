
package com.labresource.service;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.InterInstitutionBilling;
import com.labresource.repository.InterInstitutionBillingRepository;
import com.labresource.service.InterInstitutionBillingService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class InterInstitutionBillingServiceImpl
        implements InterInstitutionBillingService {

    private final InterInstitutionBillingRepository billingRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public InterInstitutionBillingServiceImpl(
            InterInstitutionBillingRepository billingRepository
    ) {
        this.billingRepository = billingRepository;
    }


    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public InterInstitutionBilling createBilling(
            InterInstitutionBilling billing
    ) {

        validateBilling(billing);

        if (billing.getBillingDate() == null) {
            billing.setBillingDate(LocalDate.now());
        }

        if (billing.getBillingStatus() == null) {
            billing.setBillingStatus(
                    BillingStatus.PENDING
            );
        }

        if (billing.getUsageHours() == null) {
            billing.setUsageHours(0.0);
        }

        if (billing.getAmount() == null) {
            billing.setAmount(0.0);
        }

        validateUsageHours(
                billing.getUsageHours()
        );

        validateAmount(
                billing.getAmount()
        );

        return billingRepository.save(billing);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public InterInstitutionBilling updateBilling(
            Long id,
            InterInstitutionBilling updatedBilling
    ) {

        InterInstitutionBilling existingBilling =
                getBillingById(id);

        validateBilling(updatedBilling);

        existingBilling.setSharingInstitution(
                updatedBilling.getSharingInstitution()
        );

        existingBilling.setUsingInstitution(
                updatedBilling.getUsingInstitution()
        );

        existingBilling.setEquipment(
                updatedBilling.getEquipment()
        );

        existingBilling.setUsageHours(
                updatedBilling.getUsageHours()
        );

        existingBilling.setAmount(
                updatedBilling.getAmount()
        );

        existingBilling.setBillingStatus(
                updatedBilling.getBillingStatus()
        );

        existingBilling.setBillingDate(
                updatedBilling.getBillingDate()
        );

        if (existingBilling.getBillingDate() == null) {
            existingBilling.setBillingDate(
                    LocalDate.now()
            );
        }

        if (existingBilling.getBillingStatus() == null) {
            existingBilling.setBillingStatus(
                    BillingStatus.PENDING
            );
        }

        if (existingBilling.getUsageHours() == null) {
            existingBilling.setUsageHours(0.0);
        }

        if (existingBilling.getAmount() == null) {
            existingBilling.setAmount(0.0);
        }

        validateUsageHours(
                existingBilling.getUsageHours()
        );

        validateAmount(
                existingBilling.getAmount()
        );

        return billingRepository.save(
                existingBilling
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InterInstitutionBilling getBillingById(
            Long id
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Billing ID cannot be null"
            );
        }

        return billingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inter-institution billing record " +
                                "not found with id: " + id
                        )
                );
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling> getAllBillings() {

        return billingRepository.findAll();
    }


    // =========================================================
    // GET BY SHARING INSTITUTION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getBillingsBySharingInstitution(
            Long institutionId
    ) {

        validateId(
                institutionId,
                "Sharing institution ID"
        );

        return billingRepository
                .findBySharingInstitutionId(
                        institutionId
                );
    }


    // =========================================================
    // GET BY USING INSTITUTION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getBillingsByUsingInstitution(
            Long institutionId
    ) {

        validateId(
                institutionId,
                "Using institution ID"
        );

        return billingRepository
                .findByUsingInstitutionId(
                        institutionId
                );
    }


    // =========================================================
    // GET BY EQUIPMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getBillingsByEquipment(
            Long equipmentId
    ) {

        validateId(
                equipmentId,
                "Equipment ID"
        );

        return billingRepository
                .findByEquipmentId(
                        equipmentId
                );
    }


    // =========================================================
    // GET BY BILLING STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getBillingsByStatus(
            BillingStatus billingStatus
    ) {

        if (billingStatus == null) {
            throw new IllegalArgumentException(
                    "Billing status cannot be null"
            );
        }

        return billingRepository
                .findByBillingStatus(
                        billingStatus
                );
    }


    // =========================================================
    // GET BY BILLING DATE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getBillingsByDate(
            LocalDate billingDate
    ) {

        if (billingDate == null) {
            throw new IllegalArgumentException(
                    "Billing date cannot be null"
            );
        }

        return billingRepository.findByBillingDate(
                billingDate
        );
    }


    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getBillingsByDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );

        return billingRepository
                .findByBillingDateBetween(
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // SHARING INSTITUTION + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getSharingInstitutionBillingsByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateId(
                institutionId,
                "Sharing institution ID"
        );

        validateDateRange(
                startDate,
                endDate
        );

        return billingRepository
                .findBySharingInstitutionIdAndBillingDateBetween(
                        institutionId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // USING INSTITUTION + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getUsingInstitutionBillingsByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateId(
                institutionId,
                "Using institution ID"
        );

        validateDateRange(
                startDate,
                endDate
        );

        return billingRepository
                .findByUsingInstitutionIdAndBillingDateBetween(
                        institutionId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // EQUIPMENT + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterInstitutionBilling>
    getEquipmentBillingsByDateRange(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateId(
                equipmentId,
                "Equipment ID"
        );

        validateDateRange(
                startDate,
                endDate
        );

        return billingRepository
                .findByEquipmentIdAndBillingDateBetween(
                        equipmentId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // CALCULATE BILLING AMOUNT
    // =========================================================

    @Override
    public Double calculateBillingAmount(
            Double usageHours,
            Double ratePerHour
    ) {

        validateUsageHours(
                usageHours
        );

        if (ratePerHour == null) {
            throw new IllegalArgumentException(
                    "Rate per hour cannot be null"
            );
        }

        if (ratePerHour < 0) {
            throw new IllegalArgumentException(
                    "Rate per hour cannot be negative"
            );
        }

        double amount =
                usageHours * ratePerHour;

        return Math.round(
                amount * 100.0
        ) / 100.0;
    }


    // =========================================================
    // UPDATE BILLING STATUS
    // =========================================================

    @Override
    public InterInstitutionBilling updateBillingStatus(
            Long id,
            BillingStatus billingStatus
    ) {

        if (billingStatus == null) {
            throw new IllegalArgumentException(
                    "Billing status cannot be null"
            );
        }

        InterInstitutionBilling billing =
                getBillingById(id);

        billing.setBillingStatus(
                billingStatus
        );

        return billingRepository.save(
                billing
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteBilling(
            Long id
    ) {

        InterInstitutionBilling billing =
                getBillingById(id);

        billingRepository.delete(
                billing
        );
    }


    // =========================================================
    // VALIDATE BILLING
    // =========================================================

    private void validateBilling(
            InterInstitutionBilling billing
    ) {

        if (billing == null) {
            throw new IllegalArgumentException(
                    "Billing data cannot be null"
            );
        }

        if (billing.getSharingInstitution() == null) {
            throw new IllegalArgumentException(
                    "Sharing institution is required"
            );
        }

        if (billing.getUsingInstitution() == null) {
            throw new IllegalArgumentException(
                    "Using institution is required"
            );
        }

        if (billing.getEquipment() == null) {
            throw new IllegalArgumentException(
                    "Equipment is required"
            );
        }

        if (billing.getSharingInstitution()
                .getId() != null
                && billing.getUsingInstitution()
                .getId() != null
                && billing.getSharingInstitution()
                .getId()
                .equals(
                        billing.getUsingInstitution()
                                .getId()
                )) {

            throw new IllegalArgumentException(
                    "Sharing institution and using institution " +
                    "must be different"
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
    // VALIDATE USAGE HOURS
    // =========================================================

    private void validateUsageHours(
            Double usageHours
    ) {

        if (usageHours == null) {
            throw new IllegalArgumentException(
                    "Usage hours cannot be null"
            );
        }

        if (usageHours < 0) {
            throw new IllegalArgumentException(
                    "Usage hours cannot be negative"
            );
        }
    }


    // =========================================================
    // VALIDATE AMOUNT
    // =========================================================

    private void validateAmount(
            Double amount
    ) {

        if (amount == null) {
            throw new IllegalArgumentException(
                    "Amount cannot be null"
            );
        }

        if (amount < 0) {
            throw new IllegalArgumentException(
                    "Amount cannot be negative"
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
