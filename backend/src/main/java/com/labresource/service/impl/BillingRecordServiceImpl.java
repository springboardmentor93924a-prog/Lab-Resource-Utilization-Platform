package com.labresource.service.impl;

import com.labresource.dto.BillingRecordRequestDto;
import com.labresource.dto.BillingRecordResponseDto;
import com.labresource.entity.BillingRecord;
import com.labresource.entity.ExternalBooking;
import com.labresource.entity.Institution;
import com.labresource.entity.User;
import com.labresource.repository.BillingRecordRepository;
import com.labresource.repository.ExternalBookingRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.BillingRecordService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BillingRecordServiceImpl implements BillingRecordService {

    private final BillingRecordRepository billingRecordRepository;
    private final ExternalBookingRepository externalBookingRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    public BillingRecordServiceImpl(
            BillingRecordRepository billingRecordRepository,
            ExternalBookingRepository externalBookingRepository,
            InstitutionRepository institutionRepository,
            UserRepository userRepository
    ) {
        this.billingRecordRepository = billingRecordRepository;
        this.externalBookingRepository = externalBookingRepository;
        this.institutionRepository = institutionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public BillingRecordResponseDto createBillingRecord(
            BillingRecordRequestDto dto
    ) {

        if (billingRecordRepository.existsByInvoiceNumberIgnoreCase(
                dto.getInvoiceNumber()
        )) {
            throw new RuntimeException(
                    "Invoice number already exists"
            );
        }

        validateBillingDates(
                dto.getInvoiceDate(),
                dto.getDueDate(),
                dto.getPaidDate()
        );

        validateInstitutions(
                dto.getPayerInstitutionId(),
                dto.getReceiverInstitutionId()
        );

        ExternalBooking externalBooking =
                externalBookingRepository
                        .findById(dto.getExternalBookingId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "External booking not found"
                                ));

        Institution payerInstitution =
                institutionRepository
                        .findById(dto.getPayerInstitutionId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payer institution not found"
                                ));

        Institution receiverInstitution =
                institutionRepository
                        .findById(dto.getReceiverInstitutionId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Receiver institution not found"
                                ));

        User createdBy =
                userRepository
                        .findById(dto.getCreatedByUserId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        BillingRecord billingRecord = new BillingRecord();

        billingRecord.setExternalBooking(externalBooking);
        billingRecord.setPayerInstitution(payerInstitution);
        billingRecord.setReceiverInstitution(receiverInstitution);
        billingRecord.setCreatedBy(createdBy);

        billingRecord.setBaseAmount(dto.getBaseAmount());
        billingRecord.setTaxPercentage(dto.getTaxPercentage());

        billingRecord.setCurrency(dto.getCurrency());
        billingRecord.setInvoiceNumber(dto.getInvoiceNumber());

        billingRecord.setInvoiceDate(dto.getInvoiceDate());
        billingRecord.setDueDate(dto.getDueDate());
        billingRecord.setPaidDate(dto.getPaidDate());

        billingRecord.setBillingStatus(dto.getBillingStatus());
        billingRecord.setPaymentStatus(dto.getPaymentStatus());

        billingRecord.setDescription(dto.getDescription());
        billingRecord.setPaymentReference(
                dto.getPaymentReference()
        );
        billingRecord.setNotes(dto.getNotes());

        BillingRecord savedBillingRecord =
                billingRecordRepository.save(billingRecord);

        return mapToResponse(savedBillingRecord);
    }

    @Override
    public BillingRecordResponseDto updateBillingRecord(
            String billingRecordId,
            BillingRecordRequestDto dto
    ) {

        BillingRecord billingRecord =
                billingRecordRepository
                        .findById(billingRecordId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Billing record not found"
                                ));

        String currentInvoiceNumber =
                billingRecord.getInvoiceNumber();

        boolean invoiceNumberChanged =
                currentInvoiceNumber == null
                        || !currentInvoiceNumber.equalsIgnoreCase(
                        dto.getInvoiceNumber()
                );

        if (invoiceNumberChanged
                && billingRecordRepository
                .existsByInvoiceNumberIgnoreCase(
                        dto.getInvoiceNumber()
                )) {

            throw new RuntimeException(
                    "Invoice number already exists"
            );
        }

        validateBillingDates(
                dto.getInvoiceDate(),
                dto.getDueDate(),
                dto.getPaidDate()
        );

        validateInstitutions(
                dto.getPayerInstitutionId(),
                dto.getReceiverInstitutionId()
        );

        ExternalBooking externalBooking =
                externalBookingRepository
                        .findById(dto.getExternalBookingId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "External booking not found"
                                ));

        Institution payerInstitution =
                institutionRepository
                        .findById(dto.getPayerInstitutionId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payer institution not found"
                                ));

        Institution receiverInstitution =
                institutionRepository
                        .findById(dto.getReceiverInstitutionId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Receiver institution not found"
                                ));

        User createdBy =
                userRepository
                        .findById(dto.getCreatedByUserId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        billingRecord.setExternalBooking(externalBooking);
        billingRecord.setPayerInstitution(payerInstitution);
        billingRecord.setReceiverInstitution(receiverInstitution);
        billingRecord.setCreatedBy(createdBy);

        billingRecord.setBaseAmount(dto.getBaseAmount());
        billingRecord.setTaxPercentage(dto.getTaxPercentage());

        billingRecord.setCurrency(dto.getCurrency());
        billingRecord.setInvoiceNumber(dto.getInvoiceNumber());

        billingRecord.setInvoiceDate(dto.getInvoiceDate());
        billingRecord.setDueDate(dto.getDueDate());
        billingRecord.setPaidDate(dto.getPaidDate());

        billingRecord.setBillingStatus(dto.getBillingStatus());
        billingRecord.setPaymentStatus(dto.getPaymentStatus());

        billingRecord.setDescription(dto.getDescription());
        billingRecord.setPaymentReference(
                dto.getPaymentReference()
        );
        billingRecord.setNotes(dto.getNotes());

        BillingRecord updatedBillingRecord =
                billingRecordRepository.save(billingRecord);

        return mapToResponse(updatedBillingRecord);
    }

    @Override
    public BillingRecordResponseDto getBillingRecordById(
            String billingRecordId
    ) {

        BillingRecord billingRecord =
                billingRecordRepository
                        .findById(billingRecordId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Billing record not found"
                                ));

        return mapToResponse(billingRecord);
    }

    @Override
    public List<BillingRecordResponseDto>
    getAllBillingRecords() {

        return billingRecordRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getBillingRecordsByExternalBooking(
            String externalBookingId
    ) {

        ExternalBooking externalBooking =
                externalBookingRepository
                        .findById(externalBookingId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "External booking not found"
                                ));

        return billingRecordRepository
                .findByExternalBooking(externalBooking)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getBillingRecordsByPayerInstitution(
            String institutionId
    ) {

        Institution institution =
                institutionRepository
                        .findById(institutionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payer institution not found"
                                ));

        return billingRecordRepository
                .findByPayerInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getBillingRecordsByReceiverInstitution(
            String institutionId
    ) {

        Institution institution =
                institutionRepository
                        .findById(institutionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Receiver institution not found"
                                ));

        return billingRecordRepository
                .findByReceiverInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getBillingRecordsByBillingStatus(
            String billingStatus
    ) {

        return billingRecordRepository
                .findByBillingStatusIgnoreCase(billingStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getBillingRecordsByPaymentStatus(
            String paymentStatus
    ) {

        return billingRecordRepository
                .findByPaymentStatusIgnoreCase(paymentStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getBillingRecordsByInvoiceDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(startDate, endDate);

        return billingRecordRepository
                .findByInvoiceDateBetween(
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getPayerInstitutionBillsByDateRange(
            String institutionId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(startDate, endDate);

        Institution payerInstitution =
                institutionRepository
                        .findById(institutionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payer institution not found"
                                ));

        return billingRecordRepository
                .findByPayerInstitutionAndInvoiceDateBetween(
                        payerInstitution,
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto>
    getReceiverInstitutionBillsByDateRange(
            String institutionId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(startDate, endDate);

        Institution receiverInstitution =
                institutionRepository
                        .findById(institutionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Receiver institution not found"
                                ));

        return billingRecordRepository
                .findByReceiverInstitutionAndInvoiceDateBetween(
                        receiverInstitution,
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BillingRecordResponseDto> getOverdueBills() {

        return billingRecordRepository
                .findByPaymentStatusIgnoreCaseAndDueDateBefore(
                        "PENDING",
                        LocalDate.now()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteBillingRecord(
            String billingRecordId
    ) {

        BillingRecord billingRecord =
                billingRecordRepository
                        .findById(billingRecordId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Billing record not found"
                                ));

        billingRecordRepository.delete(billingRecord);
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null || endDate == null) {
            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }
    }

    private void validateBillingDates(
            LocalDate invoiceDate,
            LocalDate dueDate,
            LocalDate paidDate
    ) {

        if (invoiceDate == null) {
            throw new RuntimeException(
                    "Invoice date is required"
            );
        }

        if (dueDate == null) {
            throw new RuntimeException(
                    "Due date is required"
            );
        }

        if (dueDate.isBefore(invoiceDate)) {
            throw new RuntimeException(
                    "Due date cannot be before invoice date"
            );
        }

        if (paidDate != null
                && paidDate.isBefore(invoiceDate)) {

            throw new RuntimeException(
                    "Paid date cannot be before invoice date"
            );
        }
    }

    private void validateInstitutions(
            String payerInstitutionId,
            String receiverInstitutionId
    ) {

        if (payerInstitutionId.equals(
                receiverInstitutionId
        )) {
            throw new RuntimeException(
                    "Payer and receiver institutions cannot be the same"
            );
        }
    }

    private BillingRecordResponseDto mapToResponse(
            BillingRecord billingRecord
    ) {

        BillingRecordResponseDto dto =
                new BillingRecordResponseDto();

        dto.setId(billingRecord.getId());

        if (billingRecord.getExternalBooking() != null) {
            dto.setExternalBookingId(
                    billingRecord
                            .getExternalBooking()
                            .getId()
            );
        }

        if (billingRecord.getPayerInstitution() != null) {

            dto.setPayerInstitutionId(
                    billingRecord
                            .getPayerInstitution()
                            .getId()
            );

            dto.setPayerInstitutionName(
                    billingRecord
                            .getPayerInstitution()
                            .getName()
            );
        }

        if (billingRecord.getReceiverInstitution() != null) {

            dto.setReceiverInstitutionId(
                    billingRecord
                            .getReceiverInstitution()
                            .getId()
            );

            dto.setReceiverInstitutionName(
                    billingRecord
                            .getReceiverInstitution()
                            .getName()
            );
        }

        if (billingRecord.getCreatedBy() != null) {

            dto.setCreatedByUserId(
                    billingRecord
                            .getCreatedBy()
                            .getId()
            );

            String firstName =
                    billingRecord
                            .getCreatedBy()
                            .getFirstName();

            String lastName =
                    billingRecord
                            .getCreatedBy()
                            .getLastName();

            String fullName =
                    (firstName == null ? "" : firstName)
                            + " "
                            + (lastName == null ? "" : lastName);

            dto.setCreatedByUserName(
                    fullName.trim()
            );
        }

        dto.setBaseAmount(
                billingRecord.getBaseAmount()
        );

        dto.setTaxPercentage(
                billingRecord.getTaxPercentage()
        );

        dto.setTaxAmount(
                billingRecord.getTaxAmount()
        );

        dto.setTotalAmount(
                billingRecord.getTotalAmount()
        );

        dto.setCurrency(
                billingRecord.getCurrency()
        );

        dto.setInvoiceNumber(
                billingRecord.getInvoiceNumber()
        );

        dto.setInvoiceDate(
                billingRecord.getInvoiceDate()
        );

        dto.setDueDate(
                billingRecord.getDueDate()
        );

        dto.setPaidDate(
                billingRecord.getPaidDate()
        );

        dto.setBillingStatus(
                billingRecord.getBillingStatus()
        );

        dto.setPaymentStatus(
                billingRecord.getPaymentStatus()
        );

        dto.setDescription(
                billingRecord.getDescription()
        );

        dto.setPaymentReference(
                billingRecord.getPaymentReference()
        );

        dto.setNotes(
                billingRecord.getNotes()
        );

        dto.setCreatedAt(
                billingRecord.getCreatedAt()
        );

        dto.setUpdatedAt(
                billingRecord.getUpdatedAt()
        );

        return dto;
    }
}