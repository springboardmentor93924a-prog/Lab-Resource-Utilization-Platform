package com.labresource.backend.equipment.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class EquipmentSharingUpdateRequest {
    private Boolean isShareable;
    private BigDecimal externalHourlyRate;
}
