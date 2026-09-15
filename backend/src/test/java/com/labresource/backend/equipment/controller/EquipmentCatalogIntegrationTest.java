package com.labresource.backend.equipment.controller;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class EquipmentCatalogIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    private UserPrincipal getKceStudentPrincipal() {
        AppUser user = appUserRepository.findByEmail("student.it@kce.ac.in")
                .orElseGet(() -> appUserRepository.findAll().stream()
                        .filter(u -> Long.valueOf(6).equals(u.getInstitutionId()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No KCE user found in DB")));
        return new UserPrincipal(user);
    }

    @Test
    @DisplayName("1. GET /api/departments/my-institution returns all departments for KCE")
    public void testGetDepartmentsMyInstitution() throws Exception {
        UserPrincipal principal = getKceStudentPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/departments/my-institution")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))));
    }

    @Test
    @DisplayName("2. GET /api/equipment/categories returns categories for KCE")
    public void testGetCategories() throws Exception {
        UserPrincipal principal = getKceStudentPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/equipment/categories")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("3. GET /api/laboratories returns all laboratories for KCE when department is not specified")
    public void testGetLaboratoriesInstitutionWide() throws Exception {
        UserPrincipal principal = getKceStudentPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/laboratories")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))));
    }

    @Test
    @DisplayName("4. GET /api/equipment/locations returns locations for KCE")
    public void testGetLocations() throws Exception {
        UserPrincipal principal = getKceStudentPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/equipment/locations")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("5. GET /api/equipment/search returns all KCE equipment across all departments")
    public void testSearchInstitutionWide() throws Exception {
        UserPrincipal principal = getKceStudentPrincipal();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/equipment/search")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))));
    }
}
