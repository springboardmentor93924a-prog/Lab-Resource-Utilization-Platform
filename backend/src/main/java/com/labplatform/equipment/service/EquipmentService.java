package com.labplatform.equipment.service;

import com.labplatform.booking.model.Booking;
import com.labplatform.booking.model.BookingStatus;
import com.labplatform.booking.repository.BookingRepository;
import com.labplatform.equipment.dto.EquipmentRequest;
import com.labplatform.equipment.dto.EquipmentResponse;
import com.labplatform.equipment.dto.EquipmentUtilizationResponse;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.model.EquipmentStatus;
import com.labplatform.equipment.repository.EquipmentRepository;
import com.labplatform.institution.model.Institution;
import com.labplatform.institution.repository.InstitutionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final InstitutionRepository institutionRepository;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            BookingRepository bookingRepository,
                            InstitutionRepository institutionRepository) {
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.institutionRepository = institutionRepository;
    }

    public List<EquipmentResponse> getAllEquipment() {
        return equipmentRepository.findAll()
                .stream()
                .map(EquipmentResponse::new)
                .collect(Collectors.toList());
    }

    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Equipment not found with id: " + id));
        return new EquipmentResponse(equipment);
    }

    public EquipmentResponse addEquipment(EquipmentRequest request) {
        Equipment equipment = new Equipment();
        applyRequestToEquipment(equipment, request);

        Equipment saved = equipmentRepository.save(equipment);
        return new EquipmentResponse(saved);
    }

    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Equipment not found with id: " + id));

        applyRequestToEquipment(equipment, request);

        Equipment updated = equipmentRepository.save(equipment);
        return new EquipmentResponse(updated);
    }

    public void deleteEquipment(Long id) {
        if (!equipmentRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Equipment not found with id: " + id);
        }

        boolean hasBookings = !bookingRepository.findByEquipmentId(id).isEmpty();
        if (hasBookings) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete equipment: it has existing bookings referencing it");
        }

        equipmentRepository.deleteById(id);
    }

    public List<EquipmentUtilizationResponse> getUtilizationData() {
        List<Equipment> allEquipment = equipmentRepository.findAll();

        List<EquipmentUtilizationResponse> results = new ArrayList<>();
        List<Integer> allTotalBookings = new ArrayList<>();

        for (Equipment equipment : allEquipment) {
            List<Booking> bookings = bookingRepository.findByEquipmentId(equipment.getId());
            allTotalBookings.add(bookings.size());
        }

        List<Integer> sortedDescending = new ArrayList<>(allTotalBookings);
        sortedDescending.sort(Collections.reverseOrder());

        int top20PercentIndex = (int) Math.ceil(sortedDescending.size() * 0.2) - 1;
        int demandThreshold = sortedDescending.isEmpty() || top20PercentIndex < 0
                ? Integer.MAX_VALUE
                : sortedDescending.get(Math.max(top20PercentIndex, 0));

        for (Equipment equipment : allEquipment) {
            List<Booking> bookings = bookingRepository.findByEquipmentId(equipment.getId());

            int totalBookings = bookings.size();

            int usageHours = bookings.stream()
                    .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED
                            || b.getBookingStatus() == BookingStatus.COMPLETED)
                    .mapToInt(b -> b.getDurationHours() != null ? b.getDurationHours() : 0)
                    .sum();

            double maxAvailableHours = 30 * 8;
            double utilizationRate = Math.min((usageHours / maxAvailableHours) * 100, 100.0);
            utilizationRate = Math.round(utilizationRate * 10.0) / 10.0;

            boolean highDemand = totalBookings >= demandThreshold && totalBookings > 0;

            results.add(new EquipmentUtilizationResponse(
                    equipment.getId(),
                    equipment.getEquipmentName(),
                    equipment.getCategory(),
                    equipment.getStatus() != null ? equipment.getStatus().name() : null,
                    totalBookings,
                    usageHours,
                    utilizationRate,
                    highDemand
            ));
        }

        return results;
    }

    private void applyRequestToEquipment(Equipment equipment, EquipmentRequest request) {
        equipment.setEquipmentName(request.getEquipmentName());
        equipment.setAssetTag(request.getAssetTag());
        equipment.setCategory(request.getCategory());
        equipment.setDepartment(request.getDepartment());
        equipment.setManufacturer(request.getManufacturer());
        equipment.setModel(request.getModel());
        equipment.setImageUrl(request.getImageUrl());
        equipment.setCalibrationDueDate(request.getCalibrationDueDate());
        equipment.setManualDocument(request.getManualDocument());
        equipment.setCalibrationCertificate(request.getCalibrationCertificate());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                equipment.setStatus(EquipmentStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid status value. Allowed values: AVAILABLE, IN_USE, MAINTENANCE");
            }
        } else if (equipment.getStatus() == null) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
        }

        if (request.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Invalid institution id: " + request.getInstitutionId()));
            equipment.setInstitution(institution);
        } else if (equipment.getInstitution() == null) {
            Institution defaultInstitution = institutionRepository.findById(1)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR, "Default institution not found"));
            equipment.setInstitution(defaultInstitution);
        }
    }
}