
package com.labresource.service;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.InterInstitutionBilling;
import com.labresource.repository.InterInstitutionBillingRepository;
import com.labresource.service.InterInstitutionBillingService;

import com.labresource.entity.NotificationType;
import com.labresource.entity.User;
import com.labresource.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class InterInstitutionBillingServiceImpl
        implements InterInstitutionBillingService {

    private final InterInstitutionBillingRepository
        billingRepository;

    private final UserRepository
            userRepository;
    
    private final NotificationService
        notificationService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public InterInstitutionBillingServiceImpl(
        InterInstitutionBillingRepository
                billingRepository,

        UserRepository
                userRepository,

        NotificationService
                notificationService
) {

    this.billingRepository =
            billingRepository;

    this.userRepository =
            userRepository;

    this.notificationService =
            notificationService;
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
        billing.setBillingDate(
                LocalDate.now()
        );
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

    InterInstitutionBilling savedBilling =
            billingRepository.save(
                    billing
            );

    // =====================================================
    // BILLING GENERATED NOTIFICATION
    // =====================================================

    if (savedBilling.getUsingInstitution() != null &&
            savedBilling.getUsingInstitution()
                    .getId() != null) {

        String equipmentName =
                savedBilling.getEquipment() != null
                        ? savedBilling
                        .getEquipment()
                        .getName()
                        : "Shared Equipment";

        notifyInstitutionUsers(
                savedBilling
                        .getUsingInstitution()
                        .getId(),

                NotificationType
                        .BILLING_GENERATED,

                "New Billing Generated",

                "A billing record of ₹" +
                        savedBilling.getAmount() +
                        " has been generated for " +
                        equipmentName + ".",

                savedBilling.getId()
        );
    }

    // =====================================================
    // PAYMENT PENDING NOTIFICATION
    // =====================================================

    if (savedBilling.getBillingStatus() ==
            BillingStatus.PENDING &&
            savedBilling.getUsingInstitution() != null &&
            savedBilling.getUsingInstitution()
                    .getId() != null) {

        String equipmentName =
                savedBilling.getEquipment() != null
                        ? savedBilling
                        .getEquipment()
                        .getName()
                        : "Shared Equipment";

        notifyInstitutionUsers(
                savedBilling
                        .getUsingInstitution()
                        .getId(),

                NotificationType
                        .PAYMENT_PENDING,

                "Payment Pending",

                "Payment of ₹" +
                        savedBilling.getAmount() +
                        " is pending for " +
                        equipmentName + ".",

                savedBilling.getId()
        );
    }

    return savedBilling;
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

        BillingStatus previousStatus =
                existingBilling.getBillingStatus();

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

        InterInstitutionBilling savedBilling =
        billingRepository.save(
                existingBilling
        );

// =====================================================
// STATUS CHANGE NOTIFICATION
// =====================================================

BillingStatus newStatus =
        savedBilling.getBillingStatus();

boolean statusChanged =
        previousStatus != newStatus;

if (statusChanged &&
        savedBilling.getUsingInstitution() != null &&
        savedBilling.getUsingInstitution()
                .getId() != null) {

    Long usingInstitutionId =
            savedBilling
                    .getUsingInstitution()
                    .getId();

    String equipmentName =
            savedBilling.getEquipment() != null
                    ? savedBilling
                    .getEquipment()
                    .getName()
                    : "Shared Equipment";

    if (newStatus ==
            BillingStatus.GENERATED) {

        notifyInstitutionUsers(
                usingInstitutionId,

                NotificationType
                        .BILLING_GENERATED,

                "Billing Generated",

                "A billing record of ₹" +
                        savedBilling.getAmount() +
                        " has been generated for " +
                        equipmentName + ".",

                savedBilling.getId()
        );
    }

    if (newStatus ==
            BillingStatus.PENDING) {

        notifyInstitutionUsers(
                usingInstitutionId,

                NotificationType
                        .PAYMENT_PENDING,

                "Payment Pending",

                "Payment of ₹" +
                        savedBilling.getAmount() +
                        " is pending for " +
                        equipmentName + ".",

                savedBilling.getId()
        );
    }
}

return savedBilling;
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

    BillingStatus previousStatus =
            billing.getBillingStatus();

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    billing.setBillingStatus(
            billingStatus
    );

    InterInstitutionBilling updatedBilling =
            billingRepository.save(
                    billing
            );

    // =====================================================
    // PREVENT DUPLICATE NOTIFICATIONS
    // =====================================================

    boolean statusChanged =
            previousStatus != billingStatus;

    if (!statusChanged) {

        return updatedBilling;
    }

    // =====================================================
    // VALIDATE USING INSTITUTION
    // =====================================================

    if (updatedBilling.getUsingInstitution() == null ||
            updatedBilling.getUsingInstitution()
                    .getId() == null) {

        return updatedBilling;
    }

    Long usingInstitutionId =
            updatedBilling
                    .getUsingInstitution()
                    .getId();

    String equipmentName =
            updatedBilling.getEquipment() != null
                    ? updatedBilling
                    .getEquipment()
                    .getName()
                    : "Shared Equipment";

    // =====================================================
    // BILLING GENERATED
    // =====================================================

    if (billingStatus ==
            BillingStatus.GENERATED) {

        notifyInstitutionUsers(
                usingInstitutionId,

                NotificationType
                        .BILLING_GENERATED,

                "Billing Generated",

                "A billing record of ₹" +
                        updatedBilling.getAmount() +
                        " has been generated for " +
                        equipmentName + ".",

                updatedBilling.getId()
        );
    }

    // =====================================================
    // PAYMENT PENDING
    // =====================================================

    if (billingStatus ==
            BillingStatus.PENDING) {

        notifyInstitutionUsers(
                usingInstitutionId,

                NotificationType
                        .PAYMENT_PENDING,

                "Payment Pending",

                "Payment of ₹" +
                        updatedBilling.getAmount() +
                        " is pending for " +
                        equipmentName + ".",

                updatedBilling.getId()
        );
    }

    return updatedBilling;
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


    // =========================================================
// CREATE NOTIFICATION FOR INSTITUTION USERS
// =========================================================

private void notifyInstitutionUsers(
        Long institutionId,
        NotificationType type,
        String title,
        String message,
        Long referenceId
) {

    List<User> users =
            userRepository
                    .findByInstitutionId(
                            institutionId
                    );

    for (User user : users) {

        notificationService
                .createNotification(
                        user,
                        type,
                        title,
                        message,
                        referenceId,
                        "INTER_INSTITUTION_BILLING"
                );
    }
}
}
