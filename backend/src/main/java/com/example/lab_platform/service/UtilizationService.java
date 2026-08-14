package com.example.lab_platform.service;
import com.example.lab_platform.dto.UtilizationSummaryDTO;
import com.example.lab_platform.dto.UtilizationDTO;

import java.util.List;

public interface UtilizationService {

    List<UtilizationDTO> getUtilizationData();
    UtilizationSummaryDTO getUtilizationSummary();
}