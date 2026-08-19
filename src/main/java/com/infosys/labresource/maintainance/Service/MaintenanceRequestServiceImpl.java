package com.infosys.labresource.maintainance.Service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.maintainance.Entities.MaintenanceRequest;
import com.infosys.labresource.maintainance.Entities.RequestStatus;
import com.infosys.labresource.maintainance.Repository.RequestRepository;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceRequestServiceImpl implements MaintenanceRequestService{
    private final RequestRepository requestRepo;
    private final EquipmentRepository equipmentRepo;
    private final UserRepository userRepo;

    @Override
    public MaintenanceRequest createRequest(Long equipmentId, Long userId, String reason,
                                            String priority, Integer duration) {

        Equipment equipment = equipmentRepo.findById(equipmentId).orElseThrow(() -> new RuntimeException("Equipment not found"));

        UserEntity user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (duration == null || duration <= 0) {
            throw new RuntimeException("Maintenance duration must be greater than zero");
        }

        MaintenanceRequest req = new MaintenanceRequest();
        req.setEquipment(equipment);
        req.setRequestedBy(user);
        req.setReason(reason);
        req.setPriority(priority);
        req.setRequiredDuration(duration);
        req.setStatus(RequestStatus.PENDING);
        req.setCreatedAt(LocalDateTime.now());

        return requestRepo.save(req);
    }

    @Override
    public MaintenanceRequest approveRequest(Long requestId) {

        MaintenanceRequest req = getRequest(requestId);

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        req.setStatus(RequestStatus.APPROVED);

        return requestRepo.save(req);
    }
    @Override
    public MaintenanceRequest rejectRequest(Long requestId) {

        MaintenanceRequest req = getRequest(requestId);

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        req.setStatus(RequestStatus.REJECTED);

        return requestRepo.save(req);
    }

    @Override
    public MaintenanceRequest getRequest(Long requestId) {

        return requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));
    }
    @Override
    public List<MaintenanceRequest> getAllRequests() {

        return requestRepo.findAll();
    }
}
