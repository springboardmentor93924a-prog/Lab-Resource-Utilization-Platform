//package com.labresource.service;
//
//import com.labresource.dto.equipment.EquipmentRequest;
//import com.labresource.dto.equipment.EquipmentResponse;
//
//import java.util.List;
//
//public interface EquipmentService {
//
//    EquipmentResponse createEquipment(
//            EquipmentRequest request
//    );
//
//    List<EquipmentResponse> getAllEquipment();
//
//    EquipmentResponse getEquipmentById(
//            String equipmentId
//    );
//
//    List<EquipmentResponse> getEquipmentByInstitution(
//            String institutionId
//    );
//
//    List<EquipmentResponse> getEquipmentByDepartment(
//            String departmentId
//    );
//
//    List<EquipmentResponse> getEquipmentByCategory(
//            String categoryId
//    );
//
//    List<EquipmentResponse> getAvailableEquipment();
//
//    EquipmentResponse updateEquipment(
//            String equipmentId,
//            EquipmentRequest request
//    );
//
//    void deleteEquipment(
//            String equipmentId
//    );
//}

package com.labresource.service;

import com.labresource.dto.equipment.EquipmentAvailabilityResponse;
import com.labresource.dto.equipment.EquipmentRequest;
import com.labresource.dto.equipment.EquipmentResponse;
import com.labresource.dto.equipment.EquipmentStatusRequest;

import java.util.List;

public interface EquipmentService {

    EquipmentResponse createEquipment(
            EquipmentRequest request
    );

    List<EquipmentResponse> getAllEquipment();

    EquipmentResponse getEquipmentById(
            String equipmentId
    );

    List<EquipmentResponse> getEquipmentByInstitution(
            String institutionId
    );

    List<EquipmentResponse> getEquipmentByDepartment(
            String departmentId
    );

    List<EquipmentResponse> getEquipmentByCategory(
            String categoryId
    );

    List<EquipmentResponse> getAvailableEquipment();

    EquipmentResponse updateEquipment(
            String equipmentId,
            EquipmentRequest request
    );

    void deleteEquipment(
            String equipmentId
    );

    EquipmentAvailabilityResponse updateEquipmentStatus(
            String equipmentId,
            EquipmentStatusRequest request
    );

    EquipmentAvailabilityResponse checkAvailability(
            String equipmentId
    );

    List<EquipmentAvailabilityResponse> getEquipmentByStatus(
            String status
    );
}