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

    CostSummaryDTO getCostByDepartment(Long deptId);

    CostSummaryDTO getCostByInstitution(Long instId);

    // what other institutions owe this institution for shared equipment usage
    CostSummaryDTO getBillingForInstitution(Long instId);
}