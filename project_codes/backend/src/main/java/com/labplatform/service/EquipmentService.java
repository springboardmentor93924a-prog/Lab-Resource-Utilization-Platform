package com.labplatform.service;

import com.labplatform.dto.EquipmentRequest;
import com.labplatform.entity.Equipment;
import com.labplatform.entity.EquipmentStatus;
import com.labplatform.entity.Institution;
import com.labplatform.repository.EquipmentRepository;
import com.labplatform.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;

    public Equipment create(EquipmentRequest req) {
        Institution institution = institutionRepository.findById(req.getInstitutionId())
                .orElseThrow(() -> new IllegalArgumentException("Institution not found"));

        Equipment equipment = Equipment.builder()
                .name(req.getName())
                .category(req.getCategory())
                .tags(req.getTags())
                .specifications(req.getSpecifications())
                .serialNumber(req.getSerialNumber())
                .manufacturer(req.getManufacturer())
                .purchaseDate(req.getPurchaseDate())
                .purchaseCost(req.getPurchaseCost())
                .institution(institution)
                .department(req.getDepartment())
                .sharableAcrossInstitutions(req.isSharableAcrossInstitutions())
                .hourlyUsageCost(req.getHourlyUsageCost())
                .lastCalibrationDate(req.getLastCalibrationDate())
                .nextCalibrationDue(req.getNextCalibrationDue())
                .status(EquipmentStatus.AVAILABLE)
                .build();

        return equipmentRepository.save(equipment);
    }

    public Equipment update(Long id, EquipmentRequest req) {
        Equipment equipment = get(id);
        equipment.setName(req.getName());
        equipment.setCategory(req.getCategory());
        equipment.setTags(req.getTags());
        equipment.setSpecifications(req.getSpecifications());
        equipment.setSerialNumber(req.getSerialNumber());
        equipment.setManufacturer(req.getManufacturer());
        equipment.setPurchaseDate(req.getPurchaseDate());
        equipment.setPurchaseCost(req.getPurchaseCost());
        equipment.setDepartment(req.getDepartment());
        equipment.setSharableAcrossInstitutions(req.isSharableAcrossInstitutions());
        equipment.setHourlyUsageCost(req.getHourlyUsageCost());
        equipment.setLastCalibrationDate(req.getLastCalibrationDate());
        equipment.setNextCalibrationDue(req.getNextCalibrationDue());
        return equipmentRepository.save(equipment);
    }

    public Equipment get(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));
    }

    public List<Equipment> listByInstitution(Long institutionId) {
        return equipmentRepository.findByInstitutionId(institutionId);
    }

    public List<Equipment> listAll() {
        return equipmentRepository.findAll();
    }

    public List<Equipment> search(String query) {
        return equipmentRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query);
    }

    public List<Equipment> sharableEquipment() {
        return equipmentRepository.findBySharableAcrossInstitutionsTrue();
    }

    public Equipment updateStatus(Long id, EquipmentStatus status) {
        Equipment equipment = get(id);
        equipment.setStatus(status);
        return equipmentRepository.save(equipment);
    }

    public List<Equipment> calibrationDueSoon(int daysAhead) {
        return equipmentRepository.findByNextCalibrationDueBefore(LocalDate.now().plusDays(daysAhead));
    }

    public void delete(Long id) {
        equipmentRepository.deleteById(id);
    }
}
