package com.example.lab_platform.service;

import com.example.lab_platform.dto.BudgetRequestDTO;
import com.example.lab_platform.dto.BudgetUtilizationDTO;

import java.util.List;

public interface BudgetService {

    BudgetUtilizationDTO createBudget(BudgetRequestDTO request);

    List<BudgetUtilizationDTO> getAllBudgets();

    BudgetUtilizationDTO getBudgetUtilization(Integer budgetId);

    BudgetUtilizationDTO updateBudget(Integer budgetId, BudgetRequestDTO request);

    void deleteBudget(Integer budgetId);
}