package com.labresource.backend.equipment.service;

import com.labresource.backend.calibration.entity.EquipmentCalibration;
import com.labresource.backend.calibration.repository.EquipmentCalibrationRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.dto.EquipmentDepartmentAccessDto;
import com.labresource.backend.equipment.dto.EquipmentDto;
import com.labresource.backend.equipment.dto.EquipmentOperatingScheduleDto;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.entity.EquipmentDepartmentAccess;
import com.labresource.backend.equipment.entity.EquipmentDocument;
import com.labresource.backend.equipment.entity.EquipmentOperatingSchedule;
import com.labresource.backend.equipment.repository.EquipmentDepartmentAccessRepository;
import com.labresource.backend.equipment.repository.EquipmentDocumentRepository;
import com.labresource.backend.equipment.repository.EquipmentOperatingScheduleRepository;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.storage.CloudinaryUploadResult;
import com.labresource.backend.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentOperatingScheduleRepository scheduleRepository;
    private final EquipmentDocumentRepository documentRepository;
    private final EquipmentDepartmentAccessRepository accessRepository;
    private final EquipmentCalibrationRepository calibrationRepository;
    private final DepartmentRepository departmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final InstitutionRepository institutionRepository;
    private final StorageService storageService;

    public List<EquipmentDto> search(String query, String category, Long departmentId, Long institutionId,
                                    Long labId, String location, String status) {
        List<Equipment> equipmentList = equipmentRepository.search(
                blankToNull(query),
                blankToNull(category),
                departmentId,
                institutionId,
                labId,
                blankToNull(location),
                blankToNull(status)
        );

        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(d -> d.getDepartmentId(), d -> d.getName(), (a, b) -> a));
        Map<Long, String> labNames = laboratoryRepository.findAll().stream()
                .collect(Collectors.toMap(l -> l.getLabId(), l -> l.getName(), (a, b) -> a));
        Map<Long, String> instNames = institutionRepository.findAll().stream()
                .collect(Collectors.toMap(i -> i.getInstitutionId(), i -> i.getName(), (a, b) -> a));

        return equipmentList.stream()
                .map(e -> {
                    EquipmentDto dto = EquipmentDto.fromEntity(e, latestCalibration(e.getEquipmentId()));
                    if (e.getDepartmentId() != null) dto.setDepartmentName(deptNames.get(e.getDepartmentId()));
                    if (e.getLabId() != null) dto.setLabName(labNames.get(e.getLabId()));
                    if (e.getInstitutionId() != null) dto.setInstitutionName(instNames.get(e.getInstitutionId()));
                    return dto;
                })
                .toList();
    }

    public List<String> getCategories(Long institutionId, Long departmentId) {
        if (departmentId != null) {
            return equipmentRepository.findDistinctCategoriesByInstitutionIdAndDept(institutionId, departmentId);
        }
        return equipmentRepository.findDistinctCategoriesByInstitutionId(institutionId);
    }

    public List<String> getLocations(Long institutionId, Long departmentId, Long labId) {
        return equipmentRepository.findDistinctLocationsByInstitutionIdAndDeptAndLab(institutionId, departmentId, labId);
    }

    public EquipmentDto getById(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));
        EquipmentDto dto = EquipmentDto.fromEntity(equipment, latestCalibration(equipmentId));
        if (equipment.getDepartmentId() != null) {
            departmentRepository.findById(equipment.getDepartmentId()).ifPresent(d -> dto.setDepartmentName(d.getName()));
        }
        if (equipment.getLabId() != null) {
            laboratoryRepository.findById(equipment.getLabId()).ifPresent(l -> dto.setLabName(l.getName()));
        }
        if (equipment.getInstitutionId() != null) {
            institutionRepository.findById(equipment.getInstitutionId()).ifPresent(i -> dto.setInstitutionName(i.getName()));
        }
        return dto;
    }

    @Transactional
    public EquipmentDto create(EquipmentDto dto) {
        Equipment eq = new Equipment();
        mapToEntity(dto, eq);
        eq.setStatus(Equipment.AVAILABLE);
        Equipment saved = equipmentRepository.save(eq);
        return getById(saved.getEquipmentId());
    }

    @Transactional
    public EquipmentDto update(Long equipmentId, EquipmentDto dto) {
        Equipment eq = getEntity(equipmentId);
        Boolean previousShareable = eq.getIsShareable();
        BigDecimal previousExternalRate = eq.getExternalHourlyRate();
        mapToEntity(dto, eq);
        // Preserve Department Head sharing governance fields during general equipment updates
        eq.setIsShareable(previousShareable);
        eq.setExternalHourlyRate(previousExternalRate);
        Equipment saved = equipmentRepository.save(eq);
        return getById(saved.getEquipmentId());
    }

    @Transactional
    public EquipmentDto updateSharingSettings(Long equipmentId, Boolean isShareable, BigDecimal externalHourlyRate) {
        Equipment eq = getEntity(equipmentId);
        if (isShareable != null) {
            eq.setIsShareable(isShareable);
        }
        if (externalHourlyRate != null) {
            if (externalHourlyRate.compareTo(BigDecimal.ZERO) < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "External hourly rate cannot be negative.");
            }
            eq.setExternalHourlyRate(externalHourlyRate);
        }
        Equipment saved = equipmentRepository.save(eq);
        return getById(saved.getEquipmentId());
    }

    @Transactional
    public EquipmentDto updateStatus(Long equipmentId, String newStatus, boolean internalCall) {
        Equipment eq = getEntity(equipmentId);
        String current = eq.getStatus();

        if (Equipment.UNDER_MAINTENANCE.equals(current) && Equipment.AVAILABLE.equalsIgnoreCase(newStatus) && !internalCall) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Equipment under maintenance must be restored via the maintenance completion flow.");
        }

        eq.setStatus(newStatus.toUpperCase());
        Equipment saved = equipmentRepository.save(eq);
        return getById(saved.getEquipmentId());
    }

    @Transactional
    public void setSchedules(Long equipmentId, List<EquipmentOperatingScheduleDto> schedules) {
        // Clear old schedule rows
        List<EquipmentOperatingSchedule> existing = scheduleRepository.findByEquipmentId(equipmentId);
        scheduleRepository.deleteAll(existing);

        for (EquipmentOperatingScheduleDto dto : schedules) {
            EquipmentOperatingSchedule sched = new EquipmentOperatingSchedule();
            sched.setEquipmentId(equipmentId);
            sched.setDayOfWeek(dto.getDayOfWeek());
            sched.setOpenTime(dto.getOpenTime());
            sched.setCloseTime(dto.getCloseTime());
            sched.setIsAvailable(Boolean.TRUE.equals(dto.getIsAvailable()));
            scheduleRepository.save(sched);
        }
    }

    @Transactional
    public void uploadDocument(Long equipmentId, String docType, MultipartFile file, Long userId) throws IOException {
        CloudinaryUploadResult result = storageService.upload(file, "equipment_documents");
        EquipmentDocument doc = new EquipmentDocument();
        doc.setEquipmentId(equipmentId);
        doc.setDocumentType(docType.toUpperCase());
        doc.setDocumentName(file.getOriginalFilename());
        doc.setCloudinaryPublicId(result.getPublicId());
        doc.setCloudinarySecureUrl(result.getSecureUrl());
        doc.setFileSize(file.getSize());
        doc.setContentType(file.getContentType());
        doc.setUploadedBy(userId);
        documentRepository.save(doc);
    }

    @Transactional
    public void uploadImage(Long equipmentId, MultipartFile file) throws IOException {
        Equipment eq = getEntity(equipmentId);
        // Delete old image if it exists
        if (eq.getImagePublicId() != null) {
            storageService.delete(eq.getImagePublicId());
        }

        CloudinaryUploadResult result = storageService.upload(file, "equipment_images");
        eq.setImagePublicId(result.getPublicId());
        eq.setImageSecureUrl(result.getSecureUrl());
        eq.setImageFileName(file.getOriginalFilename());
        eq.setImageContentType(file.getContentType());
        equipmentRepository.save(eq);
    }

    @Transactional
    public void setAccess(Long equipmentId, List<EquipmentDepartmentAccessDto> accessList) {
        // Delete existing access definitions
        List<EquipmentDepartmentAccess> existing = accessRepository.findByEquipmentId(equipmentId);
        accessRepository.deleteAll(existing);

        for (EquipmentDepartmentAccessDto dto : accessList) {
            EquipmentDepartmentAccess access = new EquipmentDepartmentAccess();
            access.setEquipmentId(equipmentId);
            access.setDepartmentId(dto.getDepartmentId());
            access.setAccessLevel(dto.getAccessLevel().toUpperCase());
            accessRepository.save(access);
        }
    }

    private void mapToEntity(EquipmentDto dto, Equipment eq) {
        eq.setName(dto.getName());
        eq.setCategory(dto.getCategory());
        eq.setSerialNumber(dto.getSerialNumber());
        eq.setManufacturer(dto.getManufacturer());
        eq.setModel(dto.getModel());
        eq.setDescription(dto.getDescription());
        eq.setLocation(dto.getLocation());
        eq.setCapacityPerSlot(dto.getCapacityPerSlot() == null ? 1 : dto.getCapacityPerSlot());
        eq.setIsShareable(Boolean.TRUE.equals(dto.getIsShareable()));
        eq.setDepartmentId(dto.getDepartmentId());
        eq.setInstitutionId(dto.getInstitutionId());
        eq.setLabId(dto.getLabId());
        if (dto.getPurchaseDate() != null) eq.setPurchaseDate(dto.getPurchaseDate());
        if (dto.getPurchaseCost() != null) eq.setPurchaseCost(dto.getPurchaseCost());
        if (dto.getHourlyRate() != null) eq.setHourlyRate(dto.getHourlyRate());
        if (dto.getExternalHourlyRate() != null) eq.setExternalHourlyRate(dto.getExternalHourlyRate());
        if (dto.getCondition() != null) eq.setCondition(dto.getCondition());
        if (dto.getIsActive() != null) eq.setIsActive(dto.getIsActive());
        eq.setSpecifications(dto.getSpecifications());
        eq.setCalibrationRequired(Boolean.TRUE.equals(dto.getCalibrationRequired()));
        eq.setCalibrationIntervalMonths(dto.getCalibrationIntervalMonths());
    }

    public Equipment getEntity(Long equipmentId) {
        return equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));
    }

    public List<Equipment> getEntities(List<Long> equipmentIds) {
        return equipmentRepository.findAllById(equipmentIds);
    }

    public EquipmentCalibration latestCalibration(Long equipmentId) {
        return calibrationRepository.findByEquipmentIdOrderByNextDueDateDesc(equipmentId).stream()
                .max(Comparator.comparing(EquipmentCalibration::getNextDueDate))
                .orElse(null);
    }

    public boolean hasValidCalibration(Long equipmentId) {
        Equipment eq = getEntity(equipmentId);
        if (Boolean.FALSE.equals(eq.getCalibrationRequired())) {
            return true; // No calibration required
        }
        EquipmentCalibration latest = latestCalibration(equipmentId);
        return latest != null && !latest.getNextDueDate().isBefore(LocalDate.now());
    }

    public List<EquipmentDocument> getDocuments(Long equipmentId) {
        return documentRepository.findByEquipmentId(equipmentId);
    }

    public List<EquipmentCalibration> getCalibrations(Long equipmentId) {
        return calibrationRepository.findByEquipmentIdOrderByNextDueDateDesc(equipmentId);
    }

    @Transactional
    public EquipmentCalibration recordCalibration(Long equipmentId, LocalDate calibrationDate, LocalDate nextDueDate, String performedBy, String notes, MultipartFile file) throws IOException {
        Equipment eq = getEntity(equipmentId);
        EquipmentCalibration cal = new EquipmentCalibration();
        cal.setEquipmentId(equipmentId);
        cal.setCalibrationDate(calibrationDate != null ? calibrationDate : LocalDate.now());
        cal.setNextDueDate(nextDueDate != null ? nextDueDate : LocalDate.now().plusMonths(eq.getCalibrationIntervalMonths() != null ? eq.getCalibrationIntervalMonths() : 12));
        cal.setPerformedBy(performedBy);
        cal.setNotes(notes);

        if (file != null && !file.isEmpty()) {
            CloudinaryUploadResult result = storageService.upload(file, "calibration_certificates");
            cal.setCertificatePublicId(result.getPublicId());
            cal.setCertificateSecureUrl(result.getSecureUrl());
            cal.setCertificateFileName(file.getOriginalFilename());
        }

        return calibrationRepository.save(cal);
    }

    public List<EquipmentDto> searchPartnerEquipment(
            Long partnerInstitutionId,
            Long departmentId,
            Long labId,
            String category,
            String location,
            String query) {

        List<Equipment> equipmentList = equipmentRepository.searchPartnerEquipment(
                partnerInstitutionId,
                departmentId,
                labId,
                blankToNull(category),
                blankToNull(location),
                blankToNull(query)
        );

        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(d -> d.getDepartmentId(), d -> d.getName(), (a, b) -> a));
        Map<Long, String> labNames = laboratoryRepository.findAll().stream()
                .collect(Collectors.toMap(l -> l.getLabId(), l -> l.getName(), (a, b) -> a));
        Map<Long, String> instNames = institutionRepository.findAll().stream()
                .collect(Collectors.toMap(i -> i.getInstitutionId(), i -> i.getName(), (a, b) -> a));

        return equipmentList.stream()
                .map(e -> {
                    EquipmentDto dto = EquipmentDto.fromEntity(e, latestCalibration(e.getEquipmentId()));
                    if (e.getDepartmentId() != null) dto.setDepartmentName(deptNames.get(e.getDepartmentId()));
                    if (e.getLabId() != null) dto.setLabName(labNames.get(e.getLabId()));
                    if (e.getInstitutionId() != null) dto.setInstitutionName(instNames.get(e.getInstitutionId()));
                    return dto;
                })
                .toList();
    }

    public List<String> getPartnerCategories(Long partnerInstitutionId, Long departmentId) {
        return equipmentRepository.findDistinctPartnerCategoriesByInstitutionIdAndDept(partnerInstitutionId, departmentId);
    }

    public List<String> getPartnerLocations(Long partnerInstitutionId, Long departmentId, Long labId) {
        return equipmentRepository.findDistinctPartnerLocationsByInstitutionIdAndDeptAndLab(partnerInstitutionId, departmentId, labId);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
