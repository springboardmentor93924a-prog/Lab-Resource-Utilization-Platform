package com.labresource.service.impl;

import com.labresource.dto.BookingOptimizationResponseDto;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.service.BookingOptimizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BookingOptimizationServiceImpl
        implements BookingOptimizationService {

    private static final int MAX_SUGGESTED_SLOTS = 3;
    private static final int MAX_ALTERNATIVE_EQUIPMENT = 5;
    private static final int SEARCH_DAYS = 7;
    private static final int SLOT_STEP_MINUTES = 30;

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;

    public BookingOptimizationServiceImpl(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    public BookingOptimizationResponseDto
    getOptimizedBookingSuggestions(
            String equipmentId,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        validateRequestedTime(
                requestedStartTime,
                requestedEndTime
        );

        Equipment requestedEquipment =
                equipmentRepository.findById(equipmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found"
                                ));

        boolean requestedSlotAvailable =
                isEquipmentAvailableForSlot(
                        equipmentId,
                        requestedStartTime,
                        requestedEndTime
                );

        BookingOptimizationResponseDto response =
                new BookingOptimizationResponseDto();

        response.setRequestedEquipmentId(
                requestedEquipment.getId()
        );

        response.setRequestedEquipmentName(
                requestedEquipment.getName()
        );

        response.setRequestedStartTime(
                requestedStartTime
        );

        response.setRequestedEndTime(
                requestedEndTime
        );

        response.setRequestedSlotAvailable(
                requestedSlotAvailable
        );

        if (requestedSlotAvailable) {
            response.setMessage(
                    "Requested equipment is available for the selected time slot"
            );

            return response;
        }

        List<BookingOptimizationResponseDto.AvailableSlotDto>
                suggestedSlots =
                findNextAvailableSlots(
                        requestedEquipment,
                        requestedStartTime,
                        requestedEndTime
                );

        List<BookingOptimizationResponseDto.AlternativeEquipmentDto>
                alternativeEquipment =
                findAlternativeEquipment(
                        requestedEquipment,
                        requestedStartTime,
                        requestedEndTime
                );

        response.setSuggestedSlots(suggestedSlots);
        response.setAlternativeEquipment(
                alternativeEquipment
        );

        if (!suggestedSlots.isEmpty()
                || !alternativeEquipment.isEmpty()) {

            response.setMessage(
                    "Requested slot is unavailable. Alternative slots or equipment are available"
            );
        } else {
            response.setMessage(
                    "Requested slot is unavailable and no alternative was found in the current search range"
            );
        }

        return response;
    }

    @Override
    public boolean isEquipmentAvailableForSlot(
            String equipmentId,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        validateRequestedTime(
                requestedStartTime,
                requestedEndTime
        );

        Equipment equipment =
                equipmentRepository.findById(equipmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found"
                                ));

        if (!isEquipmentOperational(equipment)) {
            return false;
        }

        return !hasBookingConflict(
                equipment,
                requestedStartTime,
                requestedEndTime
        );
    }

    private List<BookingOptimizationResponseDto.AvailableSlotDto>
    findNextAvailableSlots(
            Equipment equipment,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        List<BookingOptimizationResponseDto.AvailableSlotDto>
                suggestedSlots =
                new ArrayList<>();

        Duration requestedDuration =
                Duration.between(
                        requestedStartTime,
                        requestedEndTime
                );

        LocalDateTime searchStart =
                requestedStartTime.plusMinutes(
                        SLOT_STEP_MINUTES
                );

        LocalDateTime searchLimit =
                requestedStartTime.plusDays(
                        SEARCH_DAYS
                );

        while (searchStart.isBefore(searchLimit)
                && suggestedSlots.size()
                < MAX_SUGGESTED_SLOTS) {

            LocalDateTime searchEnd =
                    searchStart.plus(requestedDuration);

            boolean available =
                    isEquipmentOperational(equipment)
                            && !hasBookingConflict(
                            equipment,
                            searchStart,
                            searchEnd
                    );

            if (available) {

                long gapMinutes =
                        Duration.between(
                                requestedEndTime,
                                searchStart
                        ).toMinutes();

                String reason;

                if (gapMinutes <= 0) {
                    reason =
                            "Available close to the requested time";
                } else {
                    reason =
                            "Next available slot after the requested time";
                }

                suggestedSlots.add(
                        new BookingOptimizationResponseDto.AvailableSlotDto(
                                searchStart,
                                searchEnd,
                                Math.max(gapMinutes, 0),
                                reason
                        )
                );

                searchStart =
                        searchEnd.plusMinutes(
                                SLOT_STEP_MINUTES
                        );
            } else {
                searchStart =
                        searchStart.plusMinutes(
                                SLOT_STEP_MINUTES
                        );
            }
        }

        return suggestedSlots;
    }

    private List<BookingOptimizationResponseDto.AlternativeEquipmentDto>
    findAlternativeEquipment(
            Equipment requestedEquipment,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        return equipmentRepository.findAll()
                .stream()
                .filter(equipment ->
                        !equipment.getId().equals(
                                requestedEquipment.getId()
                        )
                )
                .filter(equipment ->
                        hasSameCategory(
                                requestedEquipment,
                                equipment
                        )
                )
                .filter(this::isEquipmentOperational)
                .filter(equipment ->
                        !hasBookingConflict(
                                equipment,
                                requestedStartTime,
                                requestedEndTime
                        )
                )
                .sorted(
                        Comparator.comparing(
                                Equipment::getName,
                                Comparator.nullsLast(
                                        String.CASE_INSENSITIVE_ORDER
                                )
                        )
                )
                .limit(MAX_ALTERNATIVE_EQUIPMENT)
                .map(equipment ->
                        mapAlternativeEquipment(
                                equipment,
                                requestedStartTime,
                                requestedEndTime
                        )
                )
                .toList();
    }

    private boolean hasSameCategory(
            Equipment requestedEquipment,
            Equipment alternativeEquipment
    ) {

        if (requestedEquipment.getCategory() == null
                || alternativeEquipment.getCategory() == null) {

            return false;
        }

        return requestedEquipment
                .getCategory()
                .getId()
                .equals(
                        alternativeEquipment
                                .getCategory()
                                .getId()
                );
    }

    private boolean isEquipmentOperational(
            Equipment equipment
    ) {

        if (equipment == null
                || equipment.getStatus() == null) {

            return false;
        }

        String status =
                equipment.getStatus()
                        .trim()
                        .toUpperCase();

        return status.equals("AVAILABLE")
                || status.equals("BOOKED");
    }

    private boolean hasBookingConflict(
            Equipment equipment,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        return bookingRepository.findAll()
                .stream()
                .filter(booking ->
                        booking.getEquipment() != null
                )
                .filter(booking ->
                        booking.getEquipment()
                                .getId()
                                .equals(equipment.getId())
                )
                .filter(this::isBlockingBooking)
                .anyMatch(booking ->
                        overlaps(
                                booking.getStartTime(),
                                booking.getEndTime(),
                                requestedStartTime,
                                requestedEndTime
                        )
                );
    }

    private boolean isBlockingBooking(
            Booking booking
    ) {

        if (booking.getBookingStatus() == null) {
            return true;
        }

        String status =
                booking.getBookingStatus()
                        .trim()
                        .toUpperCase();

        return !status.equals("REJECTED")
                && !status.equals("CANCELLED")
                && !status.equals("COMPLETED");
    }

    private boolean overlaps(
            LocalDateTime existingStart,
            LocalDateTime existingEnd,
            LocalDateTime requestedStart,
            LocalDateTime requestedEnd
    ) {

        if (existingStart == null
                || existingEnd == null) {

            return false;
        }

        return existingStart.isBefore(requestedEnd)
                && existingEnd.isAfter(requestedStart);
    }

    private BookingOptimizationResponseDto.AlternativeEquipmentDto
    mapAlternativeEquipment(
            Equipment equipment,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        BookingOptimizationResponseDto.AlternativeEquipmentDto dto =
                new BookingOptimizationResponseDto
                        .AlternativeEquipmentDto();

        dto.setEquipmentId(equipment.getId());
        dto.setEquipmentName(equipment.getName());
        dto.setLocation(equipment.getLocation());
        dto.setStatus(equipment.getStatus());

        dto.setAvailableForRequestedSlot(
                !hasBookingConflict(
                        equipment,
                        requestedStartTime,
                        requestedEndTime
                )
        );

        dto.setUtilizationPercentage(0.0);

        if (equipment.getCategory() != null) {
            dto.setCategoryId(
                    equipment.getCategory().getId()
            );
            dto.setCategoryName(
                    equipment.getCategory().getName()
            );
        }

        if (equipment.getInstitution() != null) {
            dto.setInstitutionId(
                    equipment.getInstitution().getId()
            );
            dto.setInstitutionName(
                    equipment.getInstitution().getName()
            );
        }

        return dto;
    }

    private void validateRequestedTime(
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        if (requestedStartTime == null
                || requestedEndTime == null) {

            throw new RuntimeException(
                    "Requested start time and end time are required"
            );
        }

        if (!requestedEndTime.isAfter(
                requestedStartTime
        )) {

            throw new RuntimeException(
                    "Requested end time must be after requested start time"
            );
        }
    }
}
