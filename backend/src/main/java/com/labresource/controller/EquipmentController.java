//package com.labresource.controller;
//
//import com.labresource.dto.equipment.EquipmentRequest;
//import com.labresource.dto.equipment.EquipmentResponse;
//import com.labresource.service.EquipmentService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/equipment")
//@RequiredArgsConstructor
//public class EquipmentController {
//
//    private final EquipmentService equipmentService;
//
//    @PostMapping
//    public ResponseEntity<EquipmentResponse> createEquipment(
//            @Valid @RequestBody EquipmentRequest request
//    ) {
//
//        EquipmentResponse response =
//                equipmentService.createEquipment(request);
//
//        return ResponseEntity
//                .status(HttpStatus.CREATED)
//                .body(response);
//    }
//
//    @GetMapping
//    public ResponseEntity<List<EquipmentResponse>> getAllEquipment() {
//
//        return ResponseEntity.ok(
//                equipmentService.getAllEquipment()
//        );
//    }
//
//    @GetMapping("/{equipmentId}")
//    public ResponseEntity<EquipmentResponse> getEquipmentById(
//            @PathVariable String equipmentId
//    ) {
//
//        return ResponseEntity.ok(
//                equipmentService.getEquipmentById(equipmentId)
//        );
//    }
//
//    @GetMapping("/institution/{institutionId}")
//    public ResponseEntity<List<EquipmentResponse>>
//    getEquipmentByInstitution(
//            @PathVariable String institutionId
//    ) {
//
//        return ResponseEntity.ok(
//                equipmentService.getEquipmentByInstitution(
//                        institutionId
//                )
//        );
//    }
//
//    @GetMapping("/department/{departmentId}")
//    public ResponseEntity<List<EquipmentResponse>>
//    getEquipmentByDepartment(
//            @PathVariable String departmentId
//    ) {
//
//        return ResponseEntity.ok(
//                equipmentService.getEquipmentByDepartment(
//                        departmentId
//                )
//        );
//    }
//
//    @GetMapping("/category/{categoryId}")
//    public ResponseEntity<List<EquipmentResponse>>
//    getEquipmentByCategory(
//            @PathVariable String categoryId
//    ) {
//
//        return ResponseEntity.ok(
//                equipmentService.getEquipmentByCategory(
//                        categoryId
//                )
//        );
//    }
//
//    @GetMapping("/available")
//    public ResponseEntity<List<EquipmentResponse>>
//    getAvailableEquipment() {
//
//        return ResponseEntity.ok(
//                equipmentService.getAvailableEquipment()
//        );
//    }
//
//    @PutMapping("/{equipmentId}")
//    public ResponseEntity<EquipmentResponse> updateEquipment(
//            @PathVariable String equipmentId,
//            @Valid @RequestBody EquipmentRequest request
//    ) {
//
//        EquipmentResponse response =
//                equipmentService.updateEquipment(
//                        equipmentId,
//                        request
//                );
//
//        return ResponseEntity.ok(response);
//    }
//
//    @DeleteMapping("/{equipmentId}")
//    public ResponseEntity<Void> deleteEquipment(
//            @PathVariable String equipmentId
//    ) {
//
//        equipmentService.deleteEquipment(equipmentId);
//
//        return ResponseEntity.noContent().build();
//    }
//}





package com.labresource.controller;

import com.labresource.dto.equipment.EquipmentAvailabilityResponse;
import com.labresource.dto.equipment.EquipmentRequest;
import com.labresource.dto.equipment.EquipmentResponse;
import com.labresource.dto.equipment.EquipmentStatusRequest;
import com.labresource.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
    public ResponseEntity<EquipmentResponse> createEquipment(
            @RequestBody EquipmentRequest request
    ) {
        return ResponseEntity.ok(
                equipmentService.createEquipment(request)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<EquipmentResponse>> getAllEquipment() {

        return ResponseEntity.ok(
                equipmentService.getAllEquipment()
        );
    }

    @GetMapping("/{equipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<EquipmentResponse> getEquipmentById(
            @PathVariable String equipmentId
    ) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentById(equipmentId)
        );
    }

    @GetMapping("/institution/{institutionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY')")
    public ResponseEntity<List<EquipmentResponse>>
    getEquipmentByInstitution(
            @PathVariable String institutionId
    ) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentByInstitution(
                        institutionId
                )
        );
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY')")
    public ResponseEntity<List<EquipmentResponse>>
    getEquipmentByDepartment(
            @PathVariable String departmentId
    ) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentByDepartment(
                        departmentId
                )
        );
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<EquipmentResponse>>
    getEquipmentByCategory(
            @PathVariable String categoryId
    ) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentByCategory(
                        categoryId
                )
        );
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<EquipmentResponse>>
    getAvailableEquipment() {

        return ResponseEntity.ok(
                equipmentService.getAvailableEquipment()
        );
    }

    @PutMapping("/{equipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
    public ResponseEntity<EquipmentResponse> updateEquipment(
            @PathVariable String equipmentId,
            @RequestBody EquipmentRequest request
    ) {
        return ResponseEntity.ok(
                equipmentService.updateEquipment(
                        equipmentId,
                        request
                )
        );
    }

    @DeleteMapping("/{equipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteEquipment(
            @PathVariable String equipmentId
    ) {

        equipmentService.deleteEquipment(equipmentId);

        return ResponseEntity.ok(
                "Equipment deleted successfully"
        );
    }

    @PutMapping("/{equipmentId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
    public ResponseEntity<EquipmentAvailabilityResponse>
    updateEquipmentStatus(
            @PathVariable String equipmentId,
            @RequestBody EquipmentStatusRequest request
    ) {
        return ResponseEntity.ok(
                equipmentService.updateEquipmentStatus(
                        equipmentId,
                        request
                )
        );
    }

    @GetMapping("/{equipmentId}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<EquipmentAvailabilityResponse>
    checkAvailability(
            @PathVariable String equipmentId
    ) {
        return ResponseEntity.ok(
                equipmentService.checkAvailability(
                        equipmentId
                )
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'FACULTY')")
    public ResponseEntity<List<EquipmentAvailabilityResponse>>
    getEquipmentByStatus(
            @PathVariable String status
    ) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentByStatus(status)
        );
    }
}