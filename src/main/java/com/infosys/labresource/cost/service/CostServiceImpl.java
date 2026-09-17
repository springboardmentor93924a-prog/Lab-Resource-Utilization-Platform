package com.infosys.labresource.cost.service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.EquipmentUtilization.Entity.Utilization;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.cost.Repository.CostRepository;
import com.infosys.labresource.cost.dtos.CostResponseDTO;
import com.infosys.labresource.cost.dtos.CostSummaryDTO;
import com.infosys.labresource.cost.entity.UsageCost;
import com.infosys.labresource.user.Repository.DepartmentRepo;
import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CostServiceImpl implements CostService{

    private final CostRepository costRepo;
    private final EquipmentRepository equipRepo;
    private final InstitutionRepo instRepo;
    private final DepartmentRepo deptRepo;
private final UserRepository userRepo;
    @Override
    public void generateCost(Utilization util) {

        Booking booking = util.getBooking();
        Equipment equip = util.getEquipment();

        // no rate set on the equipment, nothing to bill, skip silently
        if (equip.getHourlyRate() == null) {
            return;
        }

        Institution usedByInst = booking.getInstitution();
        Institution ownerInst = equip.getInstitution();
        Department usedByDept = booking.getRequestedBy().getDepartment();

        double hours = util.getUsageHours() != null ? util.getUsageHours() : 0;

        BigDecimal totalCost = equip.getHourlyRate().multiply(BigDecimal.valueOf(hours));

        UsageCost cost = new UsageCost();

        cost.setBooking(booking);
        cost.setEquipment(equip);
        cost.setUsedByDepartment(usedByDept);
        cost.setUsedByInstitution(usedByInst);
        cost.setOwnerInstitution(ownerInst);
        cost.setHoursUsed(hours);
        cost.setHourlyRate(equip.getHourlyRate());
        cost.setTotalCost(totalCost);
        cost.setCrossInstitution(!usedByInst.getInstitutionId().equals(ownerInst.getInstitutionId()));
        cost.setCreatedAt(LocalDateTime.now());

        costRepo.save(cost);
    }

    @Override
    public List<CostResponseDTO> getAllCosts() {

        List<UsageCost> costList = costRepo.findAll();
        List<CostResponseDTO> resList = new ArrayList<>();

        for (UsageCost cost : costList) {
            resList.add(convertToDTO(cost));
        }

        return resList;
    }

    @Override
    public List<CostResponseDTO> getCostByEquipment(Long equipId) {

        Equipment equip = equipRepo.findById(equipId)
                .orElseThrow(() -> new RuntimeException("Equipment not found."));

        List<UsageCost> costList = costRepo.findByEquipment(equip);
        List<CostResponseDTO> resList = new ArrayList<>();

        for (UsageCost cost : costList) {
            resList.add(convertToDTO(cost));
        }

        return resList;
    }

    @Override
    public CostSummaryDTO getCostByDepartment(Long deptId, String email) {

        Department dept = deptRepo.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found."));

        // deptId comes from the URL, so it cannot be trusted on its own,
        // this is what actually checks the caller is allowed to see it
        UserEntity caller = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (caller.getRole() != Role.SYSTEM_ADMIN) {

            if (caller.getRole() == Role.INSTITUTION_ADMIN) {

                if (!dept.getInstitution().getInstitutionId().equals(caller.getInstitution().getInstitutionId())) {
                    throw new AccessDeniedException("This department does not belong to your institution.");
                }

            } else if (!dept.getDepartId().equals(caller.getDepartment().getDepartId())) {
                throw new AccessDeniedException("You are not authorized to view this department's cost data.");
            }
        }

        List<UsageCost> costList = costRepo.findByUsedByDepartment(dept);

        CostSummaryDTO dto = new CostSummaryDTO();
        dto.setId(dept.getDepartId());
        dto.setName(dept.getDepartmentName());
        dto.setTotalBookings(costList.size());

        double hours = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (UsageCost cost : costList) {
            hours += cost.getHoursUsed();
            total = total.add(cost.getTotalCost());
        }

        dto.setTotalHours(hours);
        dto.setTotalCost(total);

        return dto;
    }

    @Override
    public CostSummaryDTO getCostByInstitution(Long instId, String email) {

        Institution inst = instRepo.findById(instId)
                .orElseThrow(() -> new RuntimeException("Institution not found."));

        checkInstitutionAccess(inst, email);

        List<UsageCost> costList = costRepo.findByUsedByInstitution(inst);

        return buildSummary(inst, costList);
    }

    @Override
    public CostSummaryDTO getBillingForInstitution(Long instId, String email) {

        Institution inst = instRepo.findById(instId)
                .orElseThrow(() -> new RuntimeException("Institution not found."));

        checkInstitutionAccess(inst, email);

        // only the cross institution rows count as billing, internal usage is not billed to anyone
        List<UsageCost> costList = costRepo.findByOwnerInstitutionAndCrossInstitutionTrue(inst);

        return buildSummary(inst, costList);
    }

    // SYSTEM_ADMIN can look at any institution, INSTITUTION_ADMIN only their own
    private void checkInstitutionAccess(Institution inst, String email) {

        UserEntity caller = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (caller.getRole() == Role.SYSTEM_ADMIN) {
            return;
        }

        if (caller.getRole() != Role.INSTITUTION_ADMIN
                || !inst.getInstitutionId().equals(caller.getInstitution().getInstitutionId())) {

            throw new AccessDeniedException("You are not authorized to view this institution's data.");
        }
    }

    private CostSummaryDTO buildSummary(Institution inst, List<UsageCost> costList) {

        CostSummaryDTO dto = new CostSummaryDTO();
        dto.setId(inst.getInstitutionId());
        dto.setName(inst.getInstitutionName());
        dto.setTotalBookings(costList.size());

        double hours = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (UsageCost cost : costList) {
            hours += cost.getHoursUsed();
            total = total.add(cost.getTotalCost());
        }

        dto.setTotalHours(hours);
        dto.setTotalCost(total);

        return dto;
    }

    private CostResponseDTO convertToDTO(UsageCost cost) {

        CostResponseDTO dto = new CostResponseDTO();

        dto.setCostId(cost.getCostId());
        dto.setBookingId(cost.getBooking().getBookingId());
        dto.setEquipId(cost.getEquipment().getEquipId());
        dto.setEquipName(cost.getEquipment().getEquipName());

        if (cost.getUsedByDepartment() != null) {
            dto.setDepartmentId(cost.getUsedByDepartment().getDepartId());
            dto.setDepartmentName(cost.getUsedByDepartment().getDepartmentName());
        }

        dto.setUsedByInstitutionId(cost.getUsedByInstitution().getInstitutionId());
        dto.setOwnerInstitutionId(cost.getOwnerInstitution().getInstitutionId());
        dto.setHoursUsed(cost.getHoursUsed());
        dto.setHourlyRate(cost.getHourlyRate());
        dto.setTotalCost(cost.getTotalCost());
        dto.setCrossInstitution(cost.isCrossInstitution());
        dto.setCreatedAt(cost.getCreatedAt());

        return dto;
    }
}
