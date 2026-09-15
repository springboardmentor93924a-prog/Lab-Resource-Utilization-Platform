package com.labresource.backend.laboratory.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.laboratory.dto.LaboratoryDto;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LaboratoryServiceTest {

    @Mock
    private LaboratoryRepository laboratoryRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private com.labresource.backend.security.ResourceAuthorizationService authService;

    @InjectMocks
    private LaboratoryService laboratoryService;

    @Test
    public void createLaboratory_Success() {
        AppUser user = new AppUser();
        user.setUserId(1L);
        user.setDepartmentId(10L);
        user.setInstitutionId(100L);
        user.setEmail("manager@lab.com");
        user.setIsActive(true);

        Role role = new Role();
        role.setRoleName("ROLE_LAB_MANAGER");
        user.setRoles(Set.of(role));

        UserPrincipal principal = new UserPrincipal(user);

        Laboratory lab = new Laboratory();
        lab.setName("Nanotechnology Lab");
        lab.setLocation("Building A, Room 302");
        lab.setCapacity(10);
        lab.setDepartmentId(10L);

        Department dept = new Department();
        dept.setDepartmentId(10L);
        dept.setName("Electrical & Electronics");

        when(laboratoryRepository.save(any(Laboratory.class))).thenAnswer(i -> {
            Laboratory l = i.getArgument(0);
            l.setLabId(1L);
            return l;
        });
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(dept));

        LaboratoryDto dto = laboratoryService.createLaboratory(principal, lab);

        assertNotNull(dto);
        assertEquals(1L, dto.getLabId());
        assertEquals("Nanotechnology Lab", dto.getName());
        assertEquals("Electrical & Electronics", dto.getDepartmentName());
    }
}
