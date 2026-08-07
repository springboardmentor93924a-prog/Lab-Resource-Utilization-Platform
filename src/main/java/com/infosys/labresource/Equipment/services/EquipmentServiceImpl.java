package com.infosys.labresource.Equipment.services;

import com.infosys.labresource.Equipment.Repository.EquipCategoryRepository;
import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.dtos.EquipmentRequestDTO;
import com.infosys.labresource.Equipment.dtos.EquipmentResponseDTO;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.Equipment.entity.EquipmentCategory;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import com.infosys.labresource.user.Repository.DepartmentRepo;
import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService{

    private final EquipmentRepository equipRepo;
    private final EquipCategoryRepository equipCategoryRepo;
    private final InstitutionRepo institutionRepo;
    private final DepartmentRepo departmentRepo;

    @Override
    public EquipmentResponseDTO addEquipment(EquipmentRequestDTO requestDTO) {

        EquipmentCategory category = equipCategoryRepo.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Equipment Category not found"));

        Institution institution = institutionRepo.findById(requestDTO.getInstitutionId())
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        Department department = departmentRepo.findById(requestDTO.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Equipment equipment = new Equipment();

        equipment.setEquipName(requestDTO.getEquipmentName());
        equipment.setAssetTag(requestDTO.getAssetTag());
        equipment.setCategory(category);
        equipment.setInstitution(institution);
        equipment.setDepartment(department);
        equipment.setStatus(requestDTO.getStatus());
        equipment.setHourlyRate(requestDTO.getHourlyRate());
        equipment.setPurchaseDate(requestDTO.getPurchaseDate());
        equipment.setPurchaseCost(requestDTO.getPurchaseCost());
        equipment.setWarrantyExpiry(requestDTO.getWarrantyExpiry());

        Equipment savedEquipment = equipRepo.save(equipment);

        return convertToResponse(savedEquipment);
    }

    @Override
    public List<EquipmentResponseDTO> getAllEquipment() {

        List<Equipment> equipmentList = equipRepo.findAll();
        List<EquipmentResponseDTO> responseList = new ArrayList<>();

        for (Equipment equipment : equipmentList) {
            responseList.add(convertToResponse(equipment));
        }

        return responseList;
    }

    @Override
    public EquipmentResponseDTO getEquipmentById(Long equipmentId) {

        Equipment equipment = equipRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        return convertToResponse(equipment);
    }

    @Override
    public EquipmentResponseDTO updateEquipment(Long equipmentId, EquipmentRequestDTO requestDTO) {

        Equipment equipment = equipRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        EquipmentCategory category = equipCategoryRepo.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Equipment Category not found"));

        Institution institution = institutionRepo.findById(requestDTO.getInstitutionId())
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        Department department = departmentRepo.findById(requestDTO.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        equipment.setEquipName(requestDTO.getEquipmentName());
        equipment.setAssetTag(requestDTO.getAssetTag());
        equipment.setCategory(category);
        equipment.setInstitution(institution);
        equipment.setDepartment(department);
        equipment.setStatus(requestDTO.getStatus());
        equipment.setHourlyRate(requestDTO.getHourlyRate());
        equipment.setPurchaseDate(requestDTO.getPurchaseDate());
        equipment.setPurchaseCost(requestDTO.getPurchaseCost());
        equipment.setWarrantyExpiry(requestDTO.getWarrantyExpiry());

        Equipment updatedEquipment = equipRepo.save(equipment);

        return convertToResponse(updatedEquipment);
    }

    @Override
    public void deleteEquipment(Long equipmentId) {

        Equipment equipment = equipRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        equipRepo.delete(equipment);
    }

    @Override
    public List<EquipmentResponseDTO> getEquipmentByStatus(EquipmentStatus status) {
        return List.of();
    }

    private EquipmentResponseDTO convertToResponse(Equipment equipment) {

        EquipmentResponseDTO responseDTO = new EquipmentResponseDTO();

        responseDTO.setEquipmentId(equipment.getEquipId());
        responseDTO.setEquipmentName(equipment.getEquipName());
        responseDTO.setAssetTag(equipment.getAssetTag());

        responseDTO.setCategoryId(equipment.getCategory().getCategoryId());
        responseDTO.setCategoryName(equipment.getCategory().getCategoryName());

        responseDTO.setInstitutionId(equipment.getInstitution().getInstitutionId());
        responseDTO.setInstitutionName(equipment.getInstitution().getInstitutionName());

        responseDTO.setDepartmentId(equipment.getDepartment().getDepartId());
        responseDTO.setDepartmentName(equipment.getDepartment().getDepartmentName());

        responseDTO.setStatus(equipment.getStatus());
        responseDTO.setHourlyRate(equipment.getHourlyRate());
        responseDTO.setPurchaseDate(equipment.getPurchaseDate());
        responseDTO.setPurchaseCost(equipment.getPurchaseCost());
        responseDTO.setWarrantyExpiry(equipment.getWarrantyExpiry());

        return responseDTO;
    }
}
