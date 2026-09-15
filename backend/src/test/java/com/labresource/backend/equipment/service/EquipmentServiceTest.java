package com.labresource.backend.equipment.service;

import com.labresource.backend.calibration.repository.EquipmentCalibrationRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.dto.EquipmentDto;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.*;
import com.labresource.backend.storage.StorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private EquipmentCalibrationRepository calibrationRepository;

    @Mock
    private EquipmentOperatingScheduleRepository scheduleRepository;

    @Mock
    private EquipmentDocumentRepository documentRepository;

    @Mock
    private EquipmentDepartmentAccessRepository accessRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private EquipmentService equipmentService;

    @Test
    public void getById_Success() {
        Long eqId = 1L;
        Equipment eq = new Equipment();
        eq.setEquipmentId(eqId);
        eq.setName("HPLC");
        eq.setStatus("AVAILABLE");

        when(equipmentRepository.findById(eqId)).thenReturn(Optional.of(eq));

        EquipmentDto dto = equipmentService.getById(eqId);
        assertNotNull(dto);
        assertEquals("HPLC", dto.getName());
    }

    @Test
    public void getById_NotFound() {
        Long eqId = 1L;
        when(equipmentRepository.findById(eqId)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> {
            equipmentService.getById(eqId);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }
}
