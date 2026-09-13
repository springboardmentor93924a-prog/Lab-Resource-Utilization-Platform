package com.labresource.service;

import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.entity.SharedEquipment;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.SharedEquipmentRepository;
import com.labresource.entity.NotificationType;
import com.labresource.entity.User;
import com.labresource.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SharedEquipmentService {

    private final SharedEquipmentRepository sharedEquipmentRepository;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SharedEquipmentService(
            SharedEquipmentRepository sharedEquipmentRepository,
            EquipmentRepository equipmentRepository,
            InstitutionRepository institutionRepository,
            UserRepository userRepository,
            NotificationService notificationService
       ) {
        this.sharedEquipmentRepository =
                sharedEquipmentRepository;

        this.equipmentRepository =
                equipmentRepository;

        this.institutionRepository =
                institutionRepository;

        this.userRepository =
                userRepository;

        this.notificationService =
                notificationService;
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

    SharedEquipment saved =
            sharedEquipmentRepository.save(
                    sharedEquipment
            );

    // =====================================================
    // SHARING REQUEST NOTIFICATION
    // =====================================================

    notifyInstitutionUsers(
            saved.getSharedWithInstitution()
                    .getId(),

            NotificationType.SHARING_REQUEST,

            "New Equipment Sharing Request",

            "A sharing request has been created for equipment "
                    + saved.getEquipment()
                    .getName()
                    + " from "
                    + saved.getOwnerInstitution()
                    .getName()
                    + ".",

            saved.getId()
    );

    return saved;
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

    SharedEquipment updated =
            sharedEquipmentRepository.save(
                    sharedEquipment
            );

    String status =
            updated.getSharingStatus() != null
                    ? updated.getSharingStatus()
                    .toUpperCase()
                    : "";

    // =====================================================
    // SHARING APPROVED / ACTIVE NOTIFICATION
    // =====================================================

    if (
            status.equals("APPROVED") ||
            status.equals("ACTIVE")
    ) {

        notifyInstitutionUsers(
                updated.getSharedWithInstitution()
                        .getId(),

                NotificationType.SHARING_APPROVED,

                "Equipment Sharing Approved",

                "Your institution can now access "
                        + updated.getEquipment()
                        .getName()
                        + " shared by "
                        + updated.getOwnerInstitution()
                        .getName()
                        + ".",

                updated.getId()
        );
    }

    // =====================================================
    // SHARING REJECTED NOTIFICATION
    // =====================================================

    if (
            status.equals("REJECTED")
    ) {

        notifyInstitutionUsers(
                updated.getSharedWithInstitution()
                        .getId(),

                NotificationType.SHARING_REJECTED,

                "Equipment Sharing Request Rejected",

                "The sharing request for equipment "
                        + updated.getEquipment()
                        .getName()
                        + " has been rejected.",

                updated.getId()
        );
    }

    return updated;
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


    // =========================================================
// CREATE NOTIFICATION FOR INSTITUTION USERS
// =========================================================

private void notifyInstitutionUsers(
        Long institutionId,
        NotificationType type,
        String title,
        String message,
        Long referenceId
) {

    List<User> users =
            userRepository
                    .findByInstitutionId(
                            institutionId
                    );

    for (User user : users) {

        notificationService
                .createNotification(
                        user,
                        type,
                        title,
                        message,
                        referenceId,
                        "SHARED_EQUIPMENT"
                );
    }
}
}
