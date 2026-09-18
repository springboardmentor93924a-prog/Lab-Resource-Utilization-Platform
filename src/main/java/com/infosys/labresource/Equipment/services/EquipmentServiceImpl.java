package com.infosys.labresource.Equipment.services;

import com.infosys.labresource.Equipment.Repository.EquipCategoryRepository;
import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.dtos.EquipmentRequestDTO;
import com.infosys.labresource.Equipment.dtos.EquipmentResponseDTO;
import com.infosys.labresource.Equipment.entity.CalibrationRecord;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.Equipment.entity.EquipmentCategory;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import com.infosys.labresource.user.Repository.DepartmentRepo;
import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
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
    private final UserRepository userRepo;

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
    public List<EquipmentResponseDTO> getAllEquipment(String email) {

        UserEntity caller = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        List<Equipment> equipmentList;

        // researchers browse across institutions on purpose, that is how they
        // find equipment to request/book in the first place. everyone else
        // only sees their own scope on the dashboard.
        if (caller.getRole() == Role.RESEARCHER || caller.getRole() == Role.SYSTEM_ADMIN) {
            equipmentList = equipRepo.findAll();

        } else if (caller.getRole() == Role.INSTITUTION_ADMIN) {
            equipmentList = equipRepo.findByInstitution(caller.getInstitution());

        } else {
            // department head, lab manager, lab technician. Same institution
            // cross-check as the utilization scoping - department id alone
            // isn't trustworthy since equipment's department and institution
            // can be mismatched.
            List<Equipment> deptEquip = equipRepo.findByDepartment(caller.getDepartment());
            equipmentList = new ArrayList<>();

            for (Equipment equip : deptEquip) {
                if (equip.getInstitution().getInstitutionId().equals(caller.getInstitution().getInstitutionId())) {
                    equipmentList.add(equip);
                }
            }
        }

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
        if (equipment.getCalibrationRecord() != null) {

            CalibrationRecord calibration = equipment.getCalibrationRecord();

            responseDTO.setCalibrationId(calibration.getCalibrationId());
            responseDTO.setLastCalibrationDate(calibration.getLastCalibrationDate());
            responseDTO.setNextCalibrationDate(calibration.getNextCalibrationDate());
            responseDTO.setCertificationNumber(calibration.getCertificationNumber());
            responseDTO.setCertificationIssueDate(calibration.getCertificationIssueDate());
            responseDTO.setCertificationExpiryDate(calibration.getCertificationExpiryDate());
            responseDTO.setCertificationStatus(calibration.getCertificationStatus());
        }
        return responseDTO;
    }
}