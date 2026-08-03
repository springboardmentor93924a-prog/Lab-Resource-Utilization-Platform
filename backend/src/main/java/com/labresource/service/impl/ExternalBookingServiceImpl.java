package com.labresource.service.impl;

import com.labresource.dto.ExternalBookingRequestDto;
import com.labresource.dto.ExternalBookingResponseDto;
import com.labresource.dto.ExternalBookingReviewDto;
import com.labresource.entity.Equipment;
import com.labresource.entity.ExternalBooking;
import com.labresource.entity.Institution;
import com.labresource.entity.User;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.ExternalBookingRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.ExternalBookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ExternalBookingServiceImpl implements ExternalBookingService {

    private final ExternalBookingRepository externalBookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;

    public ExternalBookingServiceImpl(
            ExternalBookingRepository externalBookingRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            InstitutionRepository institutionRepository
    ) {
        this.externalBookingRepository = externalBookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
    }

    @Override
    public ExternalBookingResponseDto createExternalBooking(
            ExternalBookingRequestDto requestDto
    ) {

        Equipment equipment = equipmentRepository.findById(
                requestDto.getEquipmentId()
        ).orElseThrow(() -> new RuntimeException("Equipment not found"));

        User user = userRepository.findById(
                requestDto.getRequestedByUserId()
        ).orElseThrow(() -> new RuntimeException("User not found"));

        Institution requestingInstitution =
                institutionRepository.findById(
                        requestDto.getRequestingInstitutionId()
                ).orElseThrow(() -> new RuntimeException("Institution not found"));

        Institution providerInstitution =
                equipment.getInstitution();

        if (requestDto.getRequestedEndTime()
                .isBefore(requestDto.getRequestedStartTime())) {
            throw new RuntimeException("Invalid booking time");
        }

        boolean conflict =
                externalBookingRepository
                        .existsByEquipmentAndStatusIgnoreCaseAndRequestedStartTimeLessThanAndRequestedEndTimeGreaterThan(
                                equipment,
                                "APPROVED",
                                requestDto.getRequestedEndTime(),
                                requestDto.getRequestedStartTime()
                        );

        if (conflict) {
            throw new RuntimeException("Equipment already booked");
        }

        ExternalBooking booking = new ExternalBooking();

        booking.setEquipment(equipment);
        booking.setRequestedBy(user);
        booking.setRequestingInstitution(requestingInstitution);
        booking.setProviderInstitution(providerInstitution);
        booking.setRequestedStartTime(requestDto.getRequestedStartTime());
        booking.setRequestedEndTime(requestDto.getRequestedEndTime());
        booking.setPurpose(requestDto.getPurpose());
        booking.setStatus("PENDING");

        return mapToResponse(
                externalBookingRepository.save(booking)
        );
    }

    @Override
    public List<ExternalBookingResponseDto> getAllExternalBookings() {
        return externalBookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ExternalBookingResponseDto getExternalBookingById(
            String externalBookingId
    ) {
        return mapToResponse(getBooking(externalBookingId));
    }

    @Override
    public List<ExternalBookingResponseDto> getBookingsByEquipment(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        return externalBookingRepository.findByEquipment(equipment)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ExternalBookingResponseDto> getBookingsByUser(
            String userId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return externalBookingRepository.findByRequestedBy(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ExternalBookingResponseDto> getBookingsByRequestingInstitution(
            String institutionId
    ) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        return externalBookingRepository
                .findByRequestingInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ExternalBookingResponseDto> getBookingsByProviderInstitution(
            String institutionId
    ) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        return externalBookingRepository
                .findByProviderInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ExternalBookingResponseDto> getBookingsByStatus(
            String status
    ) {
        return externalBookingRepository.findByStatusIgnoreCase(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ExternalBookingResponseDto> getProviderBookingsByStatus(
            String providerInstitutionId,
            String status
    ) {

        Institution institution = institutionRepository.findById(providerInstitutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        return externalBookingRepository
                .findByProviderInstitutionAndStatusIgnoreCase(
                        institution,
                        status
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ExternalBookingResponseDto> getBookingsByDateRange(
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {

        return externalBookingRepository
                .findByRequestedStartTimeBetween(startTime, endTime)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ExternalBookingResponseDto reviewExternalBooking(
            String externalBookingId,
            ExternalBookingReviewDto reviewDto
    ) {

        ExternalBooking booking = getBooking(externalBookingId);

        User reviewer = userRepository.findById(
                reviewDto.getReviewedByUserId()
        ).orElseThrow(() -> new RuntimeException("Reviewer not found"));

        booking.setReviewedBy(reviewer);
        booking.setStatus(reviewDto.getStatus());
        booking.setReviewedAt(LocalDateTime.now());
        booking.setAccessInstructions(reviewDto.getAccessInstructions());
        booking.setRejectionReason(reviewDto.getRejectionReason());

        return mapToResponse(
                externalBookingRepository.save(booking)
        );
    }

    @Override
    public ExternalBookingResponseDto cancelExternalBooking(
            String externalBookingId,
            String userId
    ) {

        ExternalBooking booking = getBooking(externalBookingId);

        if (!booking.getRequestedBy().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        booking.setStatus("CANCELLED");

        return mapToResponse(
                externalBookingRepository.save(booking)
        );
    }

    @Override
    public ExternalBookingResponseDto completeExternalBooking(
            String externalBookingId
    ) {

        ExternalBooking booking = getBooking(externalBookingId);

        booking.setStatus("COMPLETED");

        return mapToResponse(
                externalBookingRepository.save(booking)
        );
    }

    @Override
    public void deleteExternalBooking(
            String externalBookingId
    ) {

        externalBookingRepository.delete(
                getBooking(externalBookingId)
        );
    }

    private ExternalBooking getBooking(String id) {
        return externalBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("External booking not found"));
    }

    private ExternalBookingResponseDto mapToResponse(
            ExternalBooking booking
    ) {

        ExternalBookingResponseDto dto = new ExternalBookingResponseDto();

        dto.setId(booking.getId());

        dto.setEquipmentId(booking.getEquipment().getId());
        dto.setEquipmentName(booking.getEquipment().getName());

        dto.setRequestedByUserId(booking.getRequestedBy().getId());
        dto.setRequestedByUserName(
                booking.getRequestedBy().getFirstName() + " " +
                        booking.getRequestedBy().getLastName()
        );

        dto.setRequestingInstitutionId(
                booking.getRequestingInstitution().getId()
        );
        dto.setRequestingInstitutionName(
                booking.getRequestingInstitution().getName()
        );

        dto.setProviderInstitutionId(
                booking.getProviderInstitution().getId()
        );
        dto.setProviderInstitutionName(
                booking.getProviderInstitution().getName()
        );

        if (booking.getReviewedBy() != null) {

            dto.setReviewedByUserId(
                    booking.getReviewedBy().getId()
            );

            dto.setReviewedByUserName(
                    booking.getReviewedBy().getFirstName() + " " +
                            booking.getReviewedBy().getLastName()
            );
        }

        dto.setRequestedStartTime(booking.getRequestedStartTime());
        dto.setRequestedEndTime(booking.getRequestedEndTime());

        dto.setPurpose(booking.getPurpose());
        dto.setStatus(booking.getStatus());

        dto.setAccessInstructions(
                booking.getAccessInstructions()
        );

        dto.setRejectionReason(
                booking.getRejectionReason()
        );

        dto.setReviewedAt(
                booking.getReviewedAt()
        );

        dto.setCreatedAt(
                booking.getCreatedAt()
        );

        dto.setUpdatedAt(
                booking.getUpdatedAt()
        );

        return dto;
    }
}