package com.infosys.labresource.cost.service;

import com.infosys.labresource.EquipmentUtilization.Entity.Utilization;
import com.infosys.labresource.cost.dtos.CostResponseDTO;
import com.infosys.labresource.cost.dtos.CostSummaryDTO;

import java.util.List;

public interface CostService {


    // called right when a utilization record is completed, this is what actually creates the cost row
    void generateCost(Utilization util);

    List<CostResponseDTO> getAllCosts();

    List<CostResponseDTO> getCostByEquipment(Long equipId);

    // email is the caller's own identity, used to check they're actually allowed to see this department
    CostSummaryDTO getCostByDepartment(Long deptId, String email);

    CostSummaryDTO getCostByInstitution(Long instId, String email);

    // what other institutions owe this institution for shared equipment usage
    CostSummaryDTO getBillingForInstitution(Long instId, String email);
}