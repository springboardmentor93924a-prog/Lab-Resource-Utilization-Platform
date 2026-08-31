
package com.labresource.service;

import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.entity.SharedEquipment;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.SharedEquipmentRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SharedEquipmentService {

    private final SharedEquipmentRepository sharedEquipmentRepository;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;

    public SharedEquipmentService(
            SharedEquipmentRepository sharedEquipmentRepository,
            EquipmentRepository equipmentRepository,
            InstitutionRepository institutionRepository
    ) {
        this.sharedEquipmentRepository =
                sharedEquipmentRepository;

        this.equipmentRepository =
                equipmentRepository;

        this.institutionRepository =
                institutionRepository;
    }

    // =========================================================
    // GET ALL SHARED EQUIPMENT
    // =========================================================

    public List<SharedEquipment> getAllSharedEquipment() {

        return sharedEquipmentRepository.findAll();
    }

    // =========================================================
    // GET AVAILABLE SHARED EQUIPMENT
    // =========================================================

    public List<SharedEquipment> getAvailableSharedEquipment() {

        return sharedEquipmentRepository
                .findByAvailableTrue();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public SharedEquipment getSharedEquipment(Long id) {

        return sharedEquipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shared equipment record not found"
                        )
                );
    }

    // =========================================================
    // GET BY OWNER INSTITUTION
    // =========================================================

    public List<SharedEquipment>
    getByOwnerInstitution(Long institutionId) {

        return sharedEquipmentRepository
                .findByOwnerInstitutionId(institutionId);
    }

    // =========================================================
    // GET SHARED WITH INSTITUTION
    // =========================================================

    public List<SharedEquipment>
    getBySharedWithInstitution(Long institutionId) {

        return sharedEquipmentRepository
                .findBySharedWithInstitutionId(
                        institutionId
                );
    }

    // =========================================================
    // CREATE SHARING
    // =========================================================

    public SharedEquipment createSharedEquipment(
            Long equipmentId,
            Long ownerInstitutionId,
            Long sharedWithInstitutionId,
            String sharingNotes
    ) {

        Equipment equipment =
                equipmentRepository.findById(
                        equipmentId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Equipment not found"
                        )
                );

        Institution ownerInstitution =
                institutionRepository.findById(
                        ownerInstitutionId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Owner institution not found"
                        )
                );

        Institution sharedWithInstitution =
                institutionRepository.findById(
                        sharedWithInstitutionId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Shared institution not found"
                        )
                );

        // An institution should not share equipment
        // with itself.
        if (ownerInstitutionId.equals(
                sharedWithInstitutionId
        )) {

            throw new RuntimeException(
                    "Equipment cannot be shared with the same institution"
            );
        }

        SharedEquipment sharedEquipment =
                new SharedEquipment();

        sharedEquipment.setEquipment(
                equipment
        );

        sharedEquipment.setOwnerInstitution(
                ownerInstitution
        );

        sharedEquipment.setSharedWithInstitution(
                sharedWithInstitution
        );

        sharedEquipment.setAvailable(true);

        sharedEquipment.setSharingStatus(
                "ACTIVE"
        );

        sharedEquipment.setSharingNotes(
                sharingNotes
        );

        return sharedEquipmentRepository.save(
                sharedEquipment
        );
    }

    // =========================================================
    // UPDATE SHARING
    // =========================================================

    public SharedEquipment updateSharedEquipment(
            Long id,
            Boolean available,
            String sharingStatus,
            String sharingNotes
    ) {

        SharedEquipment sharedEquipment =
                getSharedEquipment(id);

        if (available != null) {
            sharedEquipment.setAvailable(
                    available
            );
        }

        if (sharingStatus != null &&
                !sharingStatus.isBlank()) {

            sharedEquipment.setSharingStatus(
                    sharingStatus
            );
        }

        sharedEquipment.setSharingNotes(
                sharingNotes
        );

        return sharedEquipmentRepository.save(
                sharedEquipment
        );
    }

    // =========================================================
    // DELETE SHARING
    // =========================================================

    public void deleteSharedEquipment(Long id) {

        if (!sharedEquipmentRepository
                .existsById(id)) {

            throw new RuntimeException(
                    "Shared equipment record not found"
            );
        }

        sharedEquipmentRepository.deleteById(id);
    }
}
