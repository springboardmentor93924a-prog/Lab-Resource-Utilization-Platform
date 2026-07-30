//package com.labresource.service.impl;
//
//import com.labresource.dto.equipment.EquipmentRequest;
//import com.labresource.dto.equipment.EquipmentResponse;
//import com.labresource.entity.Department;
//import com.labresource.entity.Equipment;
//import com.labresource.entity.EquipmentCategory;
//import com.labresource.entity.Institution;
//import com.labresource.exception.BadRequestException;
//import com.labresource.exception.ResourceNotFoundException;
//import com.labresource.repository.DepartmentRepository;
//import com.labresource.repository.EquipmentCategoryRepository;
//import com.labresource.repository.EquipmentRepository;
//import com.labresource.repository.InstitutionRepository;
//import com.labresource.service.EquipmentService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class EquipmentServiceImpl implements EquipmentService {
//
//    private final EquipmentRepository equipmentRepository;
//    private final EquipmentCategoryRepository equipmentCategoryRepository;
//    private final InstitutionRepository institutionRepository;
//    private final DepartmentRepository departmentRepository;
//
//    @Override
//    public EquipmentResponse createEquipment(
//            EquipmentRequest request
//    ) {
//
//        if (equipmentRepository.existsBySerialNumber(
//                request.getSerialNumber())) {
//
//            throw new BadRequestException(
//                    "Equipment with this serial number already exists"
//            );
//        }
//
//        EquipmentCategory category =
//                equipmentCategoryRepository.findById(
//                                request.getCategoryId())
//                        .orElseThrow(() ->
//                                new ResourceNotFoundException(
//                                        "Equipment category not found"
//                                )
//                        );
//
//        Institution institution =
//                institutionRepository.findById(
//                                request.getInstitutionId())
//                        .orElseThrow(() ->
//                                new ResourceNotFoundException(
//                                        "Institution not found"
//                                )
//                        );
//
//        Department department =
//                departmentRepository.findById(
//                                request.getDepartmentId())
//                        .orElseThrow(() ->
//                                new ResourceNotFoundException(
//                                        "Department not found"
//                                )
//                        );
//
//        Equipment equipment = new Equipment();
//
//        equipment.setName(request.getName());
//        equipment.setDescription(request.getDescription());
//        equipment.setSerialNumber(request.getSerialNumber());
//        equipment.setManufacturer(request.getManufacturer());
//        equipment.setModelNumber(request.getModelNumber());
//        equipment.setPurchaseDate(request.getPurchaseDate());
//        equipment.setPurchaseCost(request.getPurchaseCost());
//        equipment.setLocation(request.getLocation());
//        equipment.setStatus(request.getStatus());
//        equipment.setAvailabilityStatus(
//                request.getAvailabilityStatus()
//        );
//        equipment.setImageUrl(request.getImageUrl());
//
//        equipment.setCategory(category);
//        equipment.setInstitution(institution);
//        equipment.setDepartment(department);
//
//        Equipment savedEquipment =
//                equipmentRepository.save(equipment);
//
//        return mapToResponse(savedEquipment);
//    }
//
//    @Override
//    public List<EquipmentResponse> getAllEquipment() {
//
//        return equipmentRepository.findAll()
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public EquipmentResponse getEquipmentById(
//            String equipmentId
//    ) {
//
//        Equipment equipment =
//                equipmentRepository.findById(equipmentId)
//                        .orElseThrow(() ->
//                                new ResourceNotFoundException(
//                                        "Equipment not found"
//                                )
//                        );
//
//        return mapToResponse(equipment);
//    }
//    @Override
//    public List<EquipmentResponse> getEquipmentByInstitution(
//            String institutionId
//    ) {
//
//        Institution institution = institutionRepository
//                .findById(institutionId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Institution not found"
//                        )
//                );
//
//        return equipmentRepository.findByInstitution(institution)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public List<EquipmentResponse> getEquipmentByDepartment(
//            String departmentId
//    ) {
//
//        Department department = departmentRepository
//                .findById(departmentId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Department not found"
//                        )
//                );
//
//        return equipmentRepository.findByDepartment(department)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public List<EquipmentResponse> getEquipmentByCategory(
//            String categoryId
//    ) {
//
//        EquipmentCategory category = equipmentCategoryRepository
//                .findById(categoryId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Equipment category not found"
//                        )
//                );
//
//        return equipmentRepository.findByCategory(category)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public List<EquipmentResponse> getAvailableEquipment() {
//
//        return equipmentRepository
//                .findByAvailabilityStatus("AVAILABLE")
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public EquipmentResponse updateEquipment(
//            String equipmentId,
//            EquipmentRequest request
//    ) {
//
//        Equipment equipment = equipmentRepository
//                .findById(equipmentId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Equipment not found"
//                        )
//                );
//
//        boolean serialNumberExists =
//                equipmentRepository
//                        .existsBySerialNumberAndIdNot(
//                                request.getSerialNumber(),
//                                equipmentId
//                        );
//
//        if (serialNumberExists) {
//            throw new BadRequestException(
//                    "Equipment with this serial number already exists"
//            );
//        }
//
//        EquipmentCategory category = equipmentCategoryRepository
//                .findById(request.getCategoryId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Equipment category not found"
//                        )
//                );
//
//        Institution institution = institutionRepository
//                .findById(request.getInstitutionId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Institution not found"
//                        )
//                );
//
//        Department department = departmentRepository
//                .findById(request.getDepartmentId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Department not found"
//                        )
//                );
//
//        if (department.getInstitution() == null ||
//                !department.getInstitution()
//                        .getId()
//                        .equals(institution.getId())) {
//
//            throw new BadRequestException(
//                    "Department does not belong to the selected institution"
//            );
//        }
//
//        equipment.setName(request.getName());
//        equipment.setDescription(request.getDescription());
//        equipment.setSerialNumber(request.getSerialNumber());
//        equipment.setManufacturer(request.getManufacturer());
//        equipment.setModelNumber(request.getModelNumber());
//        equipment.setPurchaseDate(request.getPurchaseDate());
//        equipment.setPurchaseCost(request.getPurchaseCost());
//        equipment.setLocation(request.getLocation());
//        equipment.setStatus(request.getStatus());
//        equipment.setAvailabilityStatus(
//                request.getAvailabilityStatus()
//        );
//        equipment.setImageUrl(request.getImageUrl());
//
//        equipment.setCategory(category);
//        equipment.setInstitution(institution);
//        equipment.setDepartment(department);
//
//        Equipment updatedEquipment =
//                equipmentRepository.save(equipment);
//
//        return mapToResponse(updatedEquipment);
//    }
//
//    @Override
//    public void deleteEquipment(
//            String equipmentId
//    ) {
//
//        Equipment equipment = equipmentRepository
//                .findById(equipmentId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Equipment not found"
//                        )
//                );
//
//        equipmentRepository.delete(equipment);
//    }
//
//    private EquipmentResponse mapToResponse(
//            Equipment equipment
//    ) {
//
//        return new EquipmentResponse(
//                equipment.getId(),
//                equipment.getName(),
//                equipment.getDescription(),
//                equipment.getSerialNumber(),
//                equipment.getManufacturer(),
//                equipment.getModelNumber(),
//                equipment.getPurchaseDate(),
//                equipment.getPurchaseCost(),
//                equipment.getLocation(),
//                equipment.getStatus(),
//                equipment.getAvailabilityStatus(),
//                equipment.getImageUrl(),
//
//                equipment.getCategory() != null
//                        ? equipment.getCategory().getId()
//                        : null,
//
//                equipment.getCategory() != null
//                        ? equipment.getCategory().getName()
//                        : null,
//
//                equipment.getInstitution() != null
//                        ? equipment.getInstitution().getId()
//                        : null,
//
//                equipment.getInstitution() != null
//                        ? equipment.getInstitution().getName()
//                        : null,
//
//                equipment.getDepartment() != null
//                        ? equipment.getDepartment().getId()
//                        : null,
//
//                equipment.getDepartment() != null
//                        ? equipment.getDepartment().getName()
//                        : null,
//
//                equipment.getCreatedAt(),
//                equipment.getUpdatedAt()
//        );
//    }
//}
package com.labresource.service.impl;

import com.labresource.dto.equipment.EquipmentAvailabilityResponse;
import com.labresource.dto.equipment.EquipmentRequest;
import com.labresource.dto.equipment.EquipmentResponse;
import com.labresource.dto.equipment.EquipmentStatusRequest;
import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentCategory;
import com.labresource.entity.Institution;
import com.labresource.exception.BadRequestException;
import com.labresource.exception.ResourceNotFoundException;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentCategoryRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentCategoryRepository equipmentCategoryRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;


    @Override
    public EquipmentResponse createEquipment(
            EquipmentRequest request
    ) {

        if (equipmentRepository.existsBySerialNumber(
                request.getSerialNumber()
        )) {

            throw new BadRequestException(
                    "Equipment with this serial number already exists"
            );
        }

        EquipmentCategory category =
                equipmentCategoryRepository
                        .findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment category not found"
                                )
                        );

        Institution institution =
                institutionRepository
                        .findById(request.getInstitutionId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Institution not found"
                                )
                        );

        Department department =
                departmentRepository
                        .findById(request.getDepartmentId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                )
                        );

        if (department.getInstitution() == null ||
                !department.getInstitution()
                        .getId()
                        .equals(institution.getId())) {

            throw new BadRequestException(
                    "Department does not belong to the selected institution"
            );
        }

        Equipment equipment = new Equipment();

        equipment.setName(request.getName());
        equipment.setDescription(request.getDescription());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setManufacturer(request.getManufacturer());
        equipment.setModelNumber(request.getModelNumber());
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setPurchaseCost(request.getPurchaseCost());
        equipment.setLocation(request.getLocation());
        equipment.setStatus(request.getStatus());
        equipment.setAvailabilityStatus(
                request.getAvailabilityStatus()
        );
        equipment.setImageUrl(request.getImageUrl());

        equipment.setCategory(category);
        equipment.setInstitution(institution);
        equipment.setDepartment(department);

        Equipment savedEquipment =
                equipmentRepository.save(equipment);

        return mapToResponse(savedEquipment);
    }

    @Override
    public List<EquipmentResponse> getAllEquipment() {

        return equipmentRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EquipmentResponse getEquipmentById(
            String equipmentId
    ) {

        Equipment equipment =
                equipmentRepository
                        .findById(equipmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment not found"
                                )
                        );

        return mapToResponse(equipment);
    }

    @Override
    public List<EquipmentResponse> getEquipmentByInstitution(
            String institutionId
    ) {

        Institution institution =
                institutionRepository
                        .findById(institutionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Institution not found"
                                )
                        );

        return equipmentRepository
                .findByInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EquipmentResponse> getEquipmentByDepartment(
            String departmentId
    ) {

        Department department =
                departmentRepository
                        .findById(departmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                )
                        );

        return equipmentRepository
                .findByDepartment(department)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EquipmentResponse> getEquipmentByCategory(
            String categoryId
    ) {

        EquipmentCategory category =
                equipmentCategoryRepository
                        .findById(categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment category not found"
                                )
                        );

        return equipmentRepository
                .findByCategory(category)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EquipmentResponse> getAvailableEquipment() {

        return equipmentRepository
                .findByAvailabilityStatusIgnoreCase("AVAILABLE")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EquipmentResponse updateEquipment(
            String equipmentId,
            EquipmentRequest request
    ) {

        Equipment equipment =
                equipmentRepository
                        .findById(equipmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment not found"
                                )
                        );

        boolean serialNumberExists =
                equipmentRepository
                        .existsBySerialNumberAndIdNot(
                                request.getSerialNumber(),
                                equipmentId
                        );

        if (serialNumberExists) {
            throw new BadRequestException(
                    "Equipment with this serial number already exists"
            );
        }

        EquipmentCategory category =
                equipmentCategoryRepository
                        .findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment category not found"
                                )
                        );

        Institution institution =
                institutionRepository
                        .findById(request.getInstitutionId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Institution not found"
                                )
                        );

        Department department =
                departmentRepository
                        .findById(request.getDepartmentId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                )
                        );

        if (department.getInstitution() == null ||
                !department.getInstitution()
                        .getId()
                        .equals(institution.getId())) {

            throw new BadRequestException(
                    "Department does not belong to the selected institution"
            );
        }

        equipment.setName(request.getName());
        equipment.setDescription(request.getDescription());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setManufacturer(request.getManufacturer());
        equipment.setModelNumber(request.getModelNumber());
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setPurchaseCost(request.getPurchaseCost());
        equipment.setLocation(request.getLocation());
        equipment.setStatus(request.getStatus());
        equipment.setAvailabilityStatus(
                request.getAvailabilityStatus()
        );
        equipment.setImageUrl(request.getImageUrl());

        equipment.setCategory(category);
        equipment.setInstitution(institution);
        equipment.setDepartment(department);

        Equipment updatedEquipment =
                equipmentRepository.save(equipment);

        return mapToResponse(updatedEquipment);
    }

    @Override
    public void deleteEquipment(
            String equipmentId
    ) {

        Equipment equipment =
                equipmentRepository
                        .findById(equipmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment not found"
                                )
                        );

        equipmentRepository.delete(equipment);
    }

    @Override
    public EquipmentAvailabilityResponse updateEquipmentStatus(
            String equipmentId,
            EquipmentStatusRequest request
    ) {

        Equipment equipment =
                equipmentRepository
                        .findById(equipmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment not found"
                                )
                        );

        if (request.getStatus() == null ||
                request.getStatus().isBlank()) {

            throw new BadRequestException(
                    "Equipment status is required"
            );
        }

        if (request.getAvailabilityStatus() == null ||
                request.getAvailabilityStatus().isBlank()) {

            throw new BadRequestException(
                    "Equipment availability status is required"
            );
        }

        equipment.setStatus(
                request.getStatus().toUpperCase()
        );

        equipment.setAvailabilityStatus(
                request.getAvailabilityStatus().toUpperCase()
        );

        Equipment updatedEquipment =
                equipmentRepository.save(equipment);

        return mapToAvailabilityResponse(updatedEquipment);
    }

    @Override
    public EquipmentAvailabilityResponse checkAvailability(
            String equipmentId
    ) {

        Equipment equipment =
                equipmentRepository
                        .findById(equipmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment not found"
                                )
                        );

        return mapToAvailabilityResponse(equipment);
    }

    @Override
    public List<EquipmentAvailabilityResponse> getEquipmentByStatus(
            String status
    ) {

        if (status == null || status.isBlank()) {
            throw new BadRequestException(
                    "Equipment status is required"
            );
        }

        return equipmentRepository
                .findByStatusIgnoreCase(status)
                .stream()
                .map(this::mapToAvailabilityResponse)
                .toList();
    }

    private EquipmentResponse mapToResponse(
            Equipment equipment
    ) {

        return new EquipmentResponse(
                equipment.getId(),
                equipment.getName(),
                equipment.getDescription(),
                equipment.getSerialNumber(),
                equipment.getManufacturer(),
                equipment.getModelNumber(),
                equipment.getPurchaseDate(),
                equipment.getPurchaseCost(),
                equipment.getLocation(),
                equipment.getStatus(),
                equipment.getAvailabilityStatus(),
                equipment.getImageUrl(),

                equipment.getCategory() != null
                        ? equipment.getCategory().getId()
                        : null,

                equipment.getCategory() != null
                        ? equipment.getCategory().getName()
                        : null,

                equipment.getInstitution() != null
                        ? equipment.getInstitution().getId()
                        : null,

                equipment.getInstitution() != null
                        ? equipment.getInstitution().getName()
                        : null,

                equipment.getDepartment() != null
                        ? equipment.getDepartment().getId()
                        : null,

                equipment.getDepartment() != null
                        ? equipment.getDepartment().getName()
                        : null,

                equipment.getCreatedAt(),
                equipment.getUpdatedAt()
        );
    }

    private EquipmentAvailabilityResponse mapToAvailabilityResponse(
            Equipment equipment
    ) {

        boolean available =
                "AVAILABLE".equalsIgnoreCase(
                        equipment.getAvailabilityStatus()
                );

        String message;

        if (available) {
            message = "Equipment is available for booking";
        } else if ("BOOKED".equalsIgnoreCase(
                equipment.getAvailabilityStatus()
        )) {
            message = "Equipment is already booked";
        } else if ("IN_USE".equalsIgnoreCase(
                equipment.getStatus()
        )) {
            message = "Equipment is currently in use";
        } else if ("UNDER_MAINTENANCE".equalsIgnoreCase(
                equipment.getStatus()
        )) {
            message = "Equipment is under maintenance";
        } else if ("UNDER_CALIBRATION".equalsIgnoreCase(
                equipment.getStatus()
        )) {
            message = "Equipment is under calibration";
        } else if ("OUT_OF_SERVICE".equalsIgnoreCase(
                equipment.getStatus()
        )) {
            message = "Equipment is out of service";
        } else {
            message = "Equipment is not available";
        }

        return new EquipmentAvailabilityResponse(
                equipment.getId(),
                equipment.getName(),
                equipment.getStatus(),
                equipment.getAvailabilityStatus(),
                available,
                message
        );
    }
}