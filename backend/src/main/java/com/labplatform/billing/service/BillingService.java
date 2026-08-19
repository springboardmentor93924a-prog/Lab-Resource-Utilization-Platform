package com.labplatform.billing.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.billing.dto.BillingRecordResponse;
import com.labplatform.billing.dto.DepartmentCostResponse;
import com.labplatform.billing.model.BillingRecord;
import com.labplatform.billing.model.BillingStatus;
import com.labplatform.billing.repository.BillingRecordRepository;
import com.labplatform.booking.model.Booking;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.institution.model.Institution;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private final BillingRecordRepository billingRecordRepository;
    private final UserRepository userRepository;

    public BillingService(
            BillingRecordRepository billingRecordRepository,
            UserRepository userRepository) {

        this.billingRecordRepository = billingRecordRepository;
        this.userRepository = userRepository;
    }

    /**
     * Called by BookingService right after a booking is successfully created.
     *
     * If the booker's institution differs from the equipment's
     * owning institution and the equipment has an hourly rate,
     * a billing record is generated automatically.
     */
    public void generateBillingRecordIfApplicable(
            Booking booking,
            User bookingUser) {

        Equipment equipment = booking.getEquipment();

        Institution owningInstitution =
                equipment.getInstitution();

        Institution bookerInstitution =
                bookingUser.getInstitution();

        // No institution assigned to the booking user
        if (bookerInstitution == null) {
            return;
        }

        // Same institution -> no inter-institution billing
        if (owningInstitution.getId()
                .equals(bookerInstitution.getId())) {

            return;
        }

        // No hourly rate -> cannot calculate billing
        if (equipment.getHourlyRate() == null) {
            return;
        }

        /*
         * Usage-based billing:
         *
         * Total Cost =
         * Hourly Rate × Duration in Hours
         */
        BigDecimal amount =
                equipment.getHourlyRate()
                        .multiply(
                                BigDecimal.valueOf(
                                        booking.getDurationHours() != null
                                                ? booking.getDurationHours()
                                                : 0
                                )
                        );

        BillingRecord record =
                new BillingRecord();

        record.setBooking(booking);
        record.setBilledInstitution(bookerInstitution);
        record.setOwningInstitution(owningInstitution);
        record.setAmount(amount);
        record.setStatus(BillingStatus.UNPAID);

        billingRecordRepository.save(record);
    }

    /**
     * Resolve the currently authenticated user.
     */
    private User resolveCurrentUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found"
                        )
                );
    }

    /**
     * Check whether the user has permission to access billing.
     */
    private boolean isAdmin(User user) {

        String role = user.getRole().getName();

        return role.equals("INSTITUTION_ADMIN")
                || role.equals("SYSTEM_ADMIN")
                || role.equals("LAB_MANAGER")
                || role.equals("DEPARTMENT_HEAD");
    }

    /**
     * Get billing records that the current institution has to pay.
     */
    public List<BillingRecordResponse> getWhatMyInstitutionOwes(
            String requesterEmail) {

        User user =
                resolveCurrentUser(requesterEmail);

        if (!isAdmin(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can view billing"
            );
        }

        if (user.getInstitution() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your account has no institution assigned"
            );
        }

        return billingRecordRepository
                .findByBilledInstitutionId(
                        user.getInstitution().getId()
                )
                .stream()
                .map(BillingRecordResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get billing records that are owed to the current institution.
     */
    public List<BillingRecordResponse> getWhatIsOwedToMyInstitution(
            String requesterEmail) {

        User user =
                resolveCurrentUser(requesterEmail);

        if (!isAdmin(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can view billing"
            );
        }

        if (user.getInstitution() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your account has no institution assigned"
            );
        }

        return billingRecordRepository
                .findByOwningInstitutionId(
                        user.getInstitution().getId()
                )
                .stream()
                .map(BillingRecordResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Department-wise cost allocation.
     *
     * Groups billing records according to the department
     * assigned to the equipment and calculates the total cost
     * for each department.
     */
    public List<DepartmentCostResponse> getDepartmentCostSummary(
            String requesterEmail) {

        User user =
                resolveCurrentUser(requesterEmail);

        if (!isAdmin(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can view billing"
            );
        }

        if (user.getInstitution() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your account has no institution assigned"
            );
        }

        /*
         * Get all billing records where the current institution
         * is the billed institution.
         */
        List<BillingRecord> records =
                billingRecordRepository
                        .findByBilledInstitutionId(
                                user.getInstitution().getId()
                        );

        /*
         * Group records by equipment department
         * and calculate the total cost for each department.
         */
        return records.stream()
                .collect(
                        Collectors.groupingBy(
                                record -> {

                                    String department =
                                            record.getBooking()
                                                    .getEquipment()
                                                    .getDepartment();

                                    if (department == null
                                            || department.trim().isEmpty()) {

                                        return "Unassigned";
                                    }

                                    return department;
                                },

                                Collectors.reducing(
                                        BigDecimal.ZERO,
                                        BillingRecord::getAmount,
                                        BigDecimal::add
                                )
                        )
                )
                .entrySet()
                .stream()

                /*
                 * Convert the grouped data into
                 * DepartmentCostResponse objects.
                 */
                .map(entry ->
                        new DepartmentCostResponse(
                                entry.getKey(),
                                entry.getValue()
                        )
                )

                /*
                 * Show departments with the highest
                 * cost first.
                 */
                .sorted(
                        (a, b) ->
                                b.getTotalCost()
                                        .compareTo(
                                                a.getTotalCost()
                                        )
                )

                .collect(Collectors.toList());
    }

    /**
     * Mark a billing record as paid.
     *
     * Only the owning institution or SYSTEM_ADMIN
     * can mark a billing record as paid.
     */
    public BillingRecordResponse markPaid(
            Integer id,
            String requesterEmail) {

        User user =
                resolveCurrentUser(requesterEmail);

        if (!isAdmin(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can mark billing as paid"
            );
        }

        BillingRecord record =
                billingRecordRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Billing record not found"
                                )
                        );

        boolean isOwner =
                record.getOwningInstitution()
                        .getId()
                        .equals(
                                user.getInstitution() != null
                                        ? user.getInstitution().getId()
                                        : -1
                        );

        boolean isSystemAdmin =
                user.getRole()
                        .getName()
                        .equals("SYSTEM_ADMIN");

        if (!isOwner && !isSystemAdmin) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the owning institution can mark a charge as paid"
            );
        }

        record.setStatus(BillingStatus.PAID);

        BillingRecord saved =
                billingRecordRepository.save(record);

        return new BillingRecordResponse(saved);
    }
}