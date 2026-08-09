package com.labplatform.sharing.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.repository.EquipmentRepository;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccessRequestService {

    private final AccessRequestRepository accessRequestRepository;
    private final EquipmentAccessGrantRepository grantRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public AccessRequestService(AccessRequestRepository accessRequestRepository,
                                EquipmentAccessGrantRepository grantRepository,
                                EquipmentRepository equipmentRepository,
                                UserRepository userRepository) {
        this.accessRequestRepository = accessRequestRepository;
        this.grantRepository = grantRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        String role = user.getRole().getName();
        return role.equals("INSTITUTION_ADMIN") || role.equals("SYSTEM_ADMIN");
    }

    public AccessRequestResponse createRequest(AccessRequestCreateRequest request, String requesterEmail) {
        User currentUser = resolveCurrentUser(requesterEmail);

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Equipment not found with id: " + request.getEquipmentId()));

        if (currentUser.getInstitution() != null
                && currentUser.getInstitution().getId().equals(equipment.getInstitution().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "This equipment already belongs to your institution");
        }

        boolean alreadyGranted = grantRepository.existsByUserIdAndEquipmentIdAndRevokedFalse(
                currentUser.getId(), equipment.getId());
        if (alreadyGranted) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "You already have access to this equipment");
        }

        boolean alreadyPending = accessRequestRepository.existsByRequestingUserIdAndEquipmentIdAndStatus(
                currentUser.getId(), equipment.getId(), AccessRequestStatus.PENDING);
        if (alreadyPending) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "You already have a pending request for this equipment");
        }

        AccessRequest accessRequest = new AccessRequest();
        accessRequest.setRequestingUser(currentUser);
        accessRequest.setEquipment(equipment);
        accessRequest.setOwningInstitution(equipment.getInstitution());
        accessRequest.setReason(request.getReason());
        accessRequest.setStatus(AccessRequestStatus.PENDING);

        AccessRequest saved = accessRequestRepository.save(accessRequest);
        return new AccessRequestResponse(saved);
    }

    public List<AccessRequestResponse> getPendingRequestsForMyInstitution(String requesterEmail) {
        User currentUser = resolveCurrentUser(requesterEmail);

        if (!isAdmin(currentUser)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only institution admins can view access requests");
        }
        if (currentUser.getInstitution() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Your account has no institution assigned");
        }

        return accessRequestRepository.findByOwningInstitutionIdAndStatus(
                        currentUser.getInstitution().getId(), AccessRequestStatus.PENDING)
                .stream()
                .map(AccessRequestResponse::new)
                .collect(Collectors.toList());
    }

    public List<AccessRequestResponse> getMyRequests(String requesterEmail) {
        User currentUser = resolveCurrentUser(requesterEmail);
        return accessRequestRepository.findByRequestingUserId(currentUser.getId())
                .stream()
                .map(AccessRequestResponse::new)
                .collect(Collectors.toList());
    }

    public AccessRequestResponse approveRequest(Integer requestId, String reviewerEmail) {
        User reviewer = resolveCurrentUser(reviewerEmail);
        AccessRequest accessRequest = findRequestOrThrow(requestId);

        validateReviewerAuthority(accessRequest, reviewer);

        if (accessRequest.getStatus() != AccessRequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "This request has already been reviewed");
        }

        accessRequest.setStatus(AccessRequestStatus.APPROVED);
        accessRequest.setReviewedBy(reviewer);
        accessRequest.setReviewedAt(java.time.LocalDateTime.now());
        accessRequestRepository.save(accessRequest);

        EquipmentAccessGrant grant = grantRepository
                .findByUserIdAndEquipmentId(accessRequest.getRequestingUser().getId(), accessRequest.getEquipment().getId())
                .orElseGet(EquipmentAccessGrant::new);

        grant.setUser(accessRequest.getRequestingUser());
        grant.setEquipment(accessRequest.getEquipment());
        grant.setGrantedBy(reviewer);
        grant.setRevoked(false);
        grantRepository.save(grant);

        return new AccessRequestResponse(accessRequest);
    }

    public AccessRequestResponse rejectRequest(Integer requestId, String reviewerEmail) {
        User reviewer = resolveCurrentUser(reviewerEmail);
        AccessRequest accessRequest = findRequestOrThrow(requestId);

        validateReviewerAuthority(accessRequest, reviewer);

        if (accessRequest.getStatus() != AccessRequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "This request has already been reviewed");
        }

        accessRequest.setStatus(AccessRequestStatus.REJECTED);
        accessRequest.setReviewedBy(reviewer);
        accessRequest.setReviewedAt(java.time.LocalDateTime.now());
        AccessRequest saved = accessRequestRepository.save(accessRequest);

        return new AccessRequestResponse(saved);
    }

    private void validateReviewerAuthority(AccessRequest accessRequest, User reviewer) {
        if (!isAdmin(reviewer)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only institution admins can review access requests");
        }
        if (reviewer.getRole().getName().equals("INSTITUTION_ADMIN")) {
            boolean sameInstitution = reviewer.getInstitution() != null
                    && reviewer.getInstitution().getId().equals(accessRequest.getOwningInstitution().getId());
            if (!sameInstitution) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Only an admin of the equipment's owning institution can review this request");
            }
        }
        // SYSTEM_ADMIN can review any request regardless of institution
    }

    private AccessRequest findRequestOrThrow(Integer id) {
        return accessRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Access request not found with id: " + id));
    }
}