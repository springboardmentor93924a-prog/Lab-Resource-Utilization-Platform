package com.labplatform.sharing.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.repository.EquipmentRepository;
import com.labplatform.notification.service.NotificationService;
import com.labplatform.sharing.dto.AccessRequestCreateRequest;
import com.labplatform.sharing.dto.AccessRequestResponse;
import com.labplatform.sharing.model.AccessRequest;
import com.labplatform.sharing.model.AccessRequestStatus;
import com.labplatform.sharing.model.EquipmentAccessGrant;
import com.labplatform.sharing.repository.AccessRequestRepository;
import com.labplatform.sharing.repository.EquipmentAccessGrantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccessRequestService {

    private final AccessRequestRepository accessRequestRepository;
    private final EquipmentAccessGrantRepository grantRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AccessRequestService(
            AccessRequestRepository accessRequestRepository,
            EquipmentAccessGrantRepository grantRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.accessRequestRepository = accessRequestRepository;
        this.grantRepository = grantRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    private boolean isAdmin(User user) {

        if (user.getRole() == null || user.getRole().getName() == null) {
            return false;
        }

        String role = user.getRole().getName();

        return role.equals("INSTITUTION_ADMIN")
                || role.equals("SYSTEM_ADMIN")
                || role.equals("LAB_MANAGER")
                || role.equals("DEPARTMENT_HEAD");
    }

    /**
     * Creates a cross-institution access request.
     *
     * After the request is created, administrators of the
     * equipment-owning institution are notified.
     */
    public AccessRequestResponse createRequest(
            AccessRequestCreateRequest request,
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equipment not found with id: " + request.getEquipmentId()));

        /*
         * Make sure the equipment actually has an owning institution.
         */
        if (equipment.getInstitution() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This equipment has no owning institution assigned");
        }

        /*
         * User cannot request equipment belonging to
         * their own institution.
         */
        if (currentUser.getInstitution() != null
                && currentUser.getInstitution().getId()
                .equals(equipment.getInstitution().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This equipment already belongs to your institution");
        }

        /*
         * Check whether access has already been granted.
         */
        boolean alreadyGranted =
                grantRepository.existsByUserIdAndEquipmentIdAndRevokedFalse(
                        currentUser.getId(),
                        equipment.getId());

        if (alreadyGranted) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You already have access to this equipment");
        }

        /*
         * Check whether the user already has a pending request.
         */
        boolean alreadyPending =
                accessRequestRepository
                        .existsByRequestingUserIdAndEquipmentIdAndStatus(
                                currentUser.getId(),
                                equipment.getId(),
                                AccessRequestStatus.PENDING);

        if (alreadyPending) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You already have a pending request for this equipment");
        }

        /*
         * Create access request.
         */
        AccessRequest accessRequest = new AccessRequest();

        accessRequest.setRequestingUser(currentUser);
        accessRequest.setEquipment(equipment);
        accessRequest.setOwningInstitution(equipment.getInstitution());
        accessRequest.setReason(request.getReason());
        accessRequest.setStatus(AccessRequestStatus.PENDING);

        AccessRequest saved =
                accessRequestRepository.save(accessRequest);

        /*
         * ---------------------------------------------------------
         * NOTIFICATION TO OWNING INSTITUTION
         * ---------------------------------------------------------
         *
         * Example:
         *
         * Sahyadri Researcher
         *       ↓
         * requests IIT equipment
         *       ↓
         * IIT Admin gets notification
         */
        notifyInstitutionAdminsAboutNewRequest(saved);

        return new AccessRequestResponse(saved);
    }

    /**
     * Sends a notification to administrators/reviewers
     * belonging to the institution that owns the equipment.
     */
    private void notifyInstitutionAdminsAboutNewRequest(
            AccessRequest accessRequest) {

        if (accessRequest.getOwningInstitution() == null) {
            return;
        }

        Integer institutionId =
                accessRequest.getOwningInstitution().getId();

        List<User> institutionUsers =
                userRepository.findAll()
                        .stream()
                        .filter(user -> user.getInstitution() != null)
                        .filter(user ->
                                user.getInstitution()
                                        .getId()
                                        .equals(institutionId))
                        .filter(this::isAdmin)
                        .collect(Collectors.toList());

        String requesterName =
                accessRequest.getRequestingUser().getFullName();

        String equipmentName =
                accessRequest.getEquipment().getEquipmentName();

        String message =
                requesterName
                        + " has requested access to "
                        + equipmentName
                        + ".";

        for (User admin : institutionUsers) {

            notificationService.create(
                    admin,
                    "ACCESS_REQUEST",
                    message
            );
        }
    }

    public List<AccessRequestResponse> getPendingRequestsForMyInstitution(
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        if (!isAdmin(currentUser)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only institution admins can view access requests");
        }

        if (currentUser.getInstitution() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your account has no institution assigned");
        }

        return accessRequestRepository
                .findByOwningInstitutionIdAndStatus(
                        currentUser.getInstitution().getId(),
                        AccessRequestStatus.PENDING)
                .stream()
                .map(AccessRequestResponse::new)
                .collect(Collectors.toList());
    }

    public List<AccessRequestResponse> getMyRequests(
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        return accessRequestRepository
                .findByRequestingUserId(currentUser.getId())
                .stream()
                .map(AccessRequestResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Approves an access request and notifies the requester.
     */
    public AccessRequestResponse approveRequest(
            Integer requestId,
            String reviewerEmail) {

        User reviewer = resolveCurrentUser(reviewerEmail);

        AccessRequest accessRequest =
                findRequestOrThrow(requestId);

        validateReviewerAuthority(
                accessRequest,
                reviewer);

        if (accessRequest.getStatus()
                != AccessRequestStatus.PENDING) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This request has already been reviewed");
        }

        /*
         * Change request status.
         */
        accessRequest.setStatus(
                AccessRequestStatus.APPROVED);

        accessRequest.setReviewedBy(reviewer);

        accessRequest.setReviewedAt(
                LocalDateTime.now());

        accessRequestRepository.save(accessRequest);

        /*
         * Create/update access grant.
         */
        EquipmentAccessGrant grant =
                grantRepository
                        .findByUserIdAndEquipmentId(
                                accessRequest
                                        .getRequestingUser()
                                        .getId(),

                                accessRequest
                                        .getEquipment()
                                        .getId())
                        .orElseGet(
                                EquipmentAccessGrant::new);

        grant.setUser(
                accessRequest.getRequestingUser());

        grant.setEquipment(
                accessRequest.getEquipment());

        grant.setGrantedBy(reviewer);

        grant.setRevoked(false);

        grantRepository.save(grant);

        /*
         * ---------------------------------------------------------
         * NOTIFY REQUESTING USER
         * ---------------------------------------------------------
         */
        String equipmentName =
                accessRequest
                        .getEquipment()
                        .getEquipmentName();

        String institutionName =
                accessRequest
                        .getOwningInstitution()
                        .getName();

        String message =
                "Your access request for "
                        + equipmentName
                        + " has been approved by "
                        + institutionName
                        + ".";

        notificationService.create(
                accessRequest.getRequestingUser(),
                "ACCESS_REQUEST_APPROVED",
                message
        );

        return new AccessRequestResponse(accessRequest);
    }

    /**
     * Rejects an access request and notifies the requester.
     */
    public AccessRequestResponse rejectRequest(
            Integer requestId,
            String reviewerEmail) {

        User reviewer = resolveCurrentUser(reviewerEmail);

        AccessRequest accessRequest =
                findRequestOrThrow(requestId);

        validateReviewerAuthority(
                accessRequest,
                reviewer);

        if (accessRequest.getStatus()
                != AccessRequestStatus.PENDING) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This request has already been reviewed");
        }

        /*
         * Change request status.
         */
        accessRequest.setStatus(
                AccessRequestStatus.REJECTED);

        accessRequest.setReviewedBy(reviewer);

        accessRequest.setReviewedAt(
                LocalDateTime.now());

        AccessRequest saved =
                accessRequestRepository.save(accessRequest);

        /*
         * ---------------------------------------------------------
         * NOTIFY REQUESTING USER
         * ---------------------------------------------------------
         */
        String equipmentName =
                accessRequest
                        .getEquipment()
                        .getEquipmentName();

        String institutionName =
                accessRequest
                        .getOwningInstitution()
                        .getName();

        String message =
                "Your access request for "
                        + equipmentName
                        + " has been rejected by "
                        + institutionName
                        + ".";

        notificationService.create(
                accessRequest.getRequestingUser(),
                "ACCESS_REQUEST_REJECTED",
                message
        );

        return new AccessRequestResponse(saved);
    }

    private void validateReviewerAuthority(
            AccessRequest accessRequest,
            User reviewer) {

        if (!isAdmin(reviewer)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only institution admins can review access requests");
        }

        String reviewerRole =
                reviewer.getRole().getName();

        /*
         * Institution-specific reviewers can only review
         * requests for their own institution.
         */
        if (reviewerRole.equals("INSTITUTION_ADMIN")
                || reviewerRole.equals("LAB_MANAGER")
                || reviewerRole.equals("DEPARTMENT_HEAD")) {

            boolean sameInstitution =
                    reviewer.getInstitution() != null
                            && accessRequest
                            .getOwningInstitution() != null
                            && reviewer
                            .getInstitution()
                            .getId()
                            .equals(
                                    accessRequest
                                            .getOwningInstitution()
                                            .getId());

            if (!sameInstitution) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Only an admin of the equipment's owning institution can review this request");
            }
        }

        /*
         * SYSTEM_ADMIN can review requests from any institution.
         */
    }

    private AccessRequest findRequestOrThrow(
            Integer id) {

        return accessRequestRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Access request not found with id: "
                                        + id));
    }
}