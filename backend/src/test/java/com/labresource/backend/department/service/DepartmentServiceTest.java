package com.labresource.backend.department.service;

import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.dto.DepartmentCreateRequestDto;
import com.labresource.backend.department.dto.DepartmentDto;
import com.labresource.backend.department.dto.LaboratoryCreateRequestDto;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private LaboratoryRepository laboratoryRepository;

    @InjectMocks
    private DepartmentService departmentService;

    private Long institutionId = 6L;

    @Test
    @DisplayName("1. Successfully create department with 1 laboratory")
    void testCreateDepartmentWithSingleLab() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Biomedical Engineering",
                "BME",
                List.of(new LaboratoryCreateRequestDto("Sensors Lab", "Block A, Room 101", null, 20))
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Biomedical Engineering"))
                .thenReturn(Optional.empty());
        when(departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, "BME"))
                .thenReturn(Optional.empty());

        Department savedDept = new Department();
        savedDept.setDepartmentId(101L);
        savedDept.setInstitutionId(institutionId);
        savedDept.setName("Biomedical Engineering");
        savedDept.setCode("BME");
        savedDept.setBudgetAllocated(BigDecimal.ZERO);
        savedDept.setIsActive(true);
        when(departmentRepository.save(any(Department.class))).thenReturn(savedDept);

        Laboratory savedLab = new Laboratory();
        savedLab.setLabId(201L);
        savedLab.setInstitutionId(institutionId);
        savedLab.setDepartmentId(101L);
        savedLab.setName("Sensors Lab");
        savedLab.setLocation("Block A, Room 101");
        savedLab.setCapacity(20);
        savedLab.setIsActive(true);
        when(laboratoryRepository.save(any(Laboratory.class))).thenReturn(savedLab);

        DepartmentDto result = departmentService.createDepartmentWithLabs(institutionId, req);

        assertThat(result).isNotNull();
        assertThat(result.getDepartmentId()).isEqualTo(101L);
        assertThat(result.getName()).isEqualTo("Biomedical Engineering");
        assertThat(result.getCode()).isEqualTo("BME");
        assertThat(result.getInstitutionId()).isEqualTo(6L);
        assertThat(result.getLaboratories()).hasSize(1);
        assertThat(result.getLaboratories().get(0).getName()).isEqualTo("Sensors Lab");
        assertThat(result.getLaboratories().get(0).getLocation()).isEqualTo("Block A, Room 101");
        assertThat(result.getLaboratories().get(0).getDepartmentId()).isEqualTo(101L);
        assertThat(result.getLaboratories().get(0).getInstitutionId()).isEqualTo(6L);

        verify(departmentRepository).save(any(Department.class));
        verify(laboratoryRepository).save(any(Laboratory.class));
    }

    @Test
    @DisplayName("2. Successfully create department with 3 laboratories and verify ID bindings")
    void testCreateDepartmentWithThreeLabs() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Biomedical Engineering",
                "BME",
                List.of(
                        new LaboratoryCreateRequestDto("Bio-instrumentation Lab", "Block A, Room 101", null, 15),
                        new LaboratoryCreateRequestDto("Medical Image Lab", "Block A, Room 102", null, 15),
                        new LaboratoryCreateRequestDto("Biomechanics Lab", "Block A, Room 103", null, 15)
                )
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Biomedical Engineering"))
                .thenReturn(Optional.empty());
        when(departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, "BME"))
                .thenReturn(Optional.empty());

        Department savedDept = new Department();
        savedDept.setDepartmentId(102L);
        savedDept.setInstitutionId(institutionId);
        savedDept.setName("Biomedical Engineering");
        savedDept.setCode("BME");
        savedDept.setBudgetAllocated(BigDecimal.ZERO);
        savedDept.setIsActive(true);
        when(departmentRepository.save(any(Department.class))).thenReturn(savedDept);

        when(laboratoryRepository.save(any(Laboratory.class))).thenAnswer(invocation -> {
            Laboratory arg = invocation.getArgument(0);
            Laboratory saved = new Laboratory();
            saved.setLabId((long) (Math.random() * 1000 + 300));
            saved.setInstitutionId(arg.getInstitutionId());
            saved.setDepartmentId(arg.getDepartmentId());
            saved.setName(arg.getName());
            saved.setLocation(arg.getLocation());
            saved.setIsActive(true);
            return saved;
        });

        DepartmentDto result = departmentService.createDepartmentWithLabs(institutionId, req);

        assertThat(result.getLaboratories()).hasSize(3);
        assertThat(result.getLaboratories()).allMatch(l -> l.getDepartmentId().equals(102L));
        assertThat(result.getLaboratories()).allMatch(l -> l.getInstitutionId().equals(6L));
        assertThat(result.getLaboratories()).extracting("name")
                .containsExactly("Bio-instrumentation Lab", "Medical Image Lab", "Biomechanics Lab");

        verify(laboratoryRepository, times(3)).save(any(Laboratory.class));
    }

    @Test
    @DisplayName("3. Duplicate department name throws 409 Conflict")
    void testDuplicateDepartmentName() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Computer Science and Engineering",
                "CSE-NEW",
                List.of(new LaboratoryCreateRequestDto("Cloud Lab", "Block C", null, 20))
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Computer Science and Engineering"))
                .thenReturn(Optional.of(new Department()));

        assertThatThrownBy(() -> departmentService.createDepartmentWithLabs(institutionId, req))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(apiEx.getMessage()).contains("A department with this name already exists");
                });

        verify(departmentRepository, never()).save(any());
        verify(laboratoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("4. Duplicate department code throws 409 Conflict")
    void testDuplicateDepartmentCode() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Cyber Security Engineering",
                "CSE",
                List.of(new LaboratoryCreateRequestDto("Security Lab", "Block S", null, 20))
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Cyber Security Engineering"))
                .thenReturn(Optional.empty());
        when(departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, "CSE"))
                .thenReturn(Optional.of(new Department()));

        assertThatThrownBy(() -> departmentService.createDepartmentWithLabs(institutionId, req))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(apiEx.getMessage()).contains("A department with this code already exists");
                });

        verify(departmentRepository, never()).save(any());
        verify(laboratoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("5. Empty laboratory list throws 400 Bad Request")
    void testEmptyLaboratoriesList() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Biotechnology",
                "BT",
                List.of()
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Biotechnology"))
                .thenReturn(Optional.empty());
        when(departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, "BT"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.createDepartmentWithLabs(institutionId, req))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(apiEx.getMessage()).contains("At least one laboratory is required");
                });
    }

    @Test
    @DisplayName("6. Blank laboratory name throws 400 Bad Request")
    void testBlankLaboratoryName() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Biotechnology",
                "BT",
                List.of(new LaboratoryCreateRequestDto("   ", "Block B", null, 10))
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Biotechnology"))
                .thenReturn(Optional.empty());
        when(departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, "BT"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.createDepartmentWithLabs(institutionId, req))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(apiEx.getMessage()).contains("Laboratory name is required");
                });
    }

    @Test
    @DisplayName("7. Blank laboratory location throws 400 Bad Request")
    void testBlankLaboratoryLocation() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Biotechnology",
                "BT",
                List.of(new LaboratoryCreateRequestDto("Bio Lab", "   ", null, 10))
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Biotechnology"))
                .thenReturn(Optional.empty());
        when(departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, "BT"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.createDepartmentWithLabs(institutionId, req))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(apiEx.getMessage()).contains("Laboratory location is required");
                });
    }

    @Test
    @DisplayName("8. Duplicate laboratory names within same request throws 400 Bad Request")
    void testDuplicateLaboratoryNamesInRequest() {
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Biotechnology",
                "BT",
                List.of(
                        new LaboratoryCreateRequestDto("Genetic Engineering Lab", "Block A, Room 101", null, 10),
                        new LaboratoryCreateRequestDto("genetic engineering lab", "Block A, Room 102", null, 10)
                )
        );

        when(departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, "Biotechnology"))
                .thenReturn(Optional.empty());
        when(departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, "BT"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.createDepartmentWithLabs(institutionId, req))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException apiEx = (ApiException) e;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(apiEx.getMessage()).contains("Duplicate laboratory name");
                });
    }

    @Test
    @DisplayName("9. GET /departments/my-institution returns departments with active laboratories")
    void testGetByInstitutionIdWithLaboratories() {
        Department dept1 = new Department();
        dept1.setDepartmentId(10L);
        dept1.setInstitutionId(institutionId);
        dept1.setName("Mechanical Engineering");
        dept1.setCode("MECH");
        dept1.setIsActive(true);

        Department dept2 = new Department();
        dept2.setDepartmentId(20L);
        dept2.setInstitutionId(institutionId);
        dept2.setName("Civil Engineering");
        dept2.setCode("CIVIL");
        dept2.setIsActive(true);

        when(departmentRepository.findByInstitutionIdAndIsActiveTrue(institutionId))
                .thenReturn(List.of(dept1, dept2));

        Laboratory lab1 = new Laboratory();
        lab1.setLabId(101L);
        lab1.setDepartmentId(10L);
        lab1.setInstitutionId(institutionId);
        lab1.setName("Thermodynamics Lab");
        lab1.setLocation("Block M, Room 101");
        lab1.setIsActive(true);

        Laboratory lab2 = new Laboratory();
        lab2.setLabId(102L);
        lab2.setDepartmentId(10L);
        lab2.setInstitutionId(institutionId);
        lab2.setName("CAD/CAM Lab");
        lab2.setLocation("Block M, Room 102");
        lab2.setIsActive(true);

        Laboratory lab3 = new Laboratory();
        lab3.setLabId(201L);
        lab3.setDepartmentId(20L);
        lab3.setInstitutionId(institutionId);
        lab3.setName("Structures Lab");
        lab3.setLocation("Block C, Room 201");
        lab3.setIsActive(true);

        when(laboratoryRepository.findByInstitutionIdAndIsActiveTrue(institutionId))
                .thenReturn(List.of(lab1, lab2, lab3));

        List<DepartmentDto> result = departmentService.getByInstitutionId(institutionId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Mechanical Engineering");
        assertThat(result.get(0).getLaboratories()).hasSize(2);
        assertThat(result.get(0).getLaboratories()).extracting("name")
                .containsExactly("Thermodynamics Lab", "CAD/CAM Lab");

        assertThat(result.get(1).getName()).isEqualTo("Civil Engineering");
        assertThat(result.get(1).getLaboratories()).hasSize(1);
        assertThat(result.get(1).getLaboratories().get(0).getName()).isEqualTo("Structures Lab");
    }

    @Test
    @DisplayName("10. GET department by ID returns department with active laboratories")
    void testGetByIdWithLaboratories() {
        Department dept = new Department();
        dept.setDepartmentId(15L);
        dept.setInstitutionId(institutionId);
        dept.setName("Chemical Engineering");
        dept.setCode("CHEM");
        dept.setIsActive(true);

        when(departmentRepository.findById(15L)).thenReturn(Optional.of(dept));

        Laboratory lab = new Laboratory();
        lab.setLabId(501L);
        lab.setDepartmentId(15L);
        lab.setInstitutionId(institutionId);
        lab.setName("Process Control Lab");
        lab.setLocation("Block CH, Room 301");
        lab.setIsActive(true);

        when(laboratoryRepository.findByDepartmentIdAndIsActiveTrue(15L)).thenReturn(List.of(lab));

        DepartmentDto result = departmentService.getById(15L);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Chemical Engineering");
        assertThat(result.getLaboratories()).hasSize(1);
        assertThat(result.getLaboratories().get(0).getName()).isEqualTo("Process Control Lab");
        assertThat(result.getLaboratories().get(0).getLocation()).isEqualTo("Block CH, Room 301");
    }
}
