package com.labresource.backend.department.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.department.dto.DepartmentCreateRequestDto;
import com.labresource.backend.department.dto.LaboratoryCreateRequestDto;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class DepartmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UserPrincipal getKceAdminPrincipal() {
        AppUser admin = appUserRepository.findByEmail("admin@kce.ac.in")
                .orElseThrow(() -> new IllegalStateException("KCE admin not found in DB"));
        return new UserPrincipal(admin);
    }

    @Test
    @DisplayName("1. POST /api/departments creates department and laboratories atomically")
    public void testCreateDepartmentWithLabsAtomic() throws Exception {
        UserPrincipal principal = getKceAdminPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String uniqueSuffix = String.valueOf(System.currentTimeMillis()).substring(7);
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Automotive Eng " + uniqueSuffix,
                "AUTO" + uniqueSuffix,
                List.of(
                        new LaboratoryCreateRequestDto("Vehicle Dynamics Lab", "Block A, Room 101", "Vehicle testing", 20),
                        new LaboratoryCreateRequestDto("Engine Testing Lab", "Block B, Room 202", "IC Engines", 25)
                )
        );

        mockMvc.perform(post("/api/departments")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", equalTo("Automotive Eng " + uniqueSuffix)))
                .andExpect(jsonPath("$.code", equalTo("AUTO" + uniqueSuffix)))
                .andExpect(jsonPath("$.institutionId", equalTo(6)))
                .andExpect(jsonPath("$.laboratories", hasSize(2)))
                .andExpect(jsonPath("$.laboratories[0].institutionId", equalTo(6)))
                .andExpect(jsonPath("$.laboratories[0].name", equalTo("Vehicle Dynamics Lab")))
                .andExpect(jsonPath("$.laboratories[0].location", equalTo("Block A, Room 101")))
                .andExpect(jsonPath("$.laboratories[1].institutionId", equalTo(6)))
                .andExpect(jsonPath("$.laboratories[1].name", equalTo("Engine Testing Lab")))
                .andExpect(jsonPath("$.laboratories[1].location", equalTo("Block B, Room 202")));
    }

    @Test
    @DisplayName("2. POST /api/departments fails with 409 when department name already exists in institution")
    public void testCreateDuplicateDepartmentName() throws Exception {
        UserPrincipal principal = getKceAdminPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Computer Science and Engineering",
                "CSE-UNIQUE",
                List.of(new LaboratoryCreateRequestDto("Lab A", "Location A", null, 10))
        );

        mockMvc.perform(post("/api/departments")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("3. POST /api/departments fails with 409 when department code already exists in institution")
    public void testCreateDuplicateDepartmentCode() throws Exception {
        UserPrincipal principal = getKceAdminPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Brand New Dept",
                "CSE", // Existing code in KCE
                List.of(new LaboratoryCreateRequestDto("Lab A", "Location A", null, 10))
        );

        mockMvc.perform(post("/api/departments")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("4. POST /api/departments fails with 400 when duplicate lab names in payload")
    public void testCreateDuplicateLabNamesInPayload() throws Exception {
        UserPrincipal principal = getKceAdminPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String uniqueSuffix = String.valueOf(System.currentTimeMillis()).substring(7);
        DepartmentCreateRequestDto req = new DepartmentCreateRequestDto(
                "Robotics Eng " + uniqueSuffix,
                "ROB" + uniqueSuffix,
                List.of(
                        new LaboratoryCreateRequestDto("Robotics Lab", "Block R, Room 1", null, 10),
                        new LaboratoryCreateRequestDto("robotics lab", "Block R, Room 2", null, 10)
                )
        );

        mockMvc.perform(post("/api/departments")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("5. GET /api/departments/my-institution returns all departments with active laboratories")
    public void testGetDepartmentsMyInstitutionWithLabs() throws Exception {
        UserPrincipal principal = getKceAdminPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/departments/my-institution")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(7))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))))
                .andExpect(jsonPath("$[0].laboratories", notNullValue()));
    }
}
