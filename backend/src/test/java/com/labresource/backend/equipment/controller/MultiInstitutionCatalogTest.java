package com.labresource.backend.equipment.controller;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MultiInstitutionCatalogTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    private UserPrincipal getPrincipalForEmail(String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
        return new UserPrincipal(user);
    }

    // =========================================================================
    // 1. KARPAGAM COLLEGE OF ENGINEERING (KCE - Institution ID 6)
    // =========================================================================

    @Test
    @DisplayName("KCE Student — Departments, Labs, Categories, Locations, Equipment all scoped to KCE (ID 6)")
    public void testKceStudentFullFlow() throws Exception {
        UserPrincipal principal = getPrincipalForEmail("student.it@kce.ac.in");
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        // 1. Departments -> only KCE (inst 6)
        mockMvc.perform(get("/api/departments/my-institution").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))));

        // 2. Laboratories -> all KCE labs (inst 6)
        mockMvc.perform(get("/api/laboratories").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))));

        // 3. Categories -> KCE distinct categories
        mockMvc.perform(get("/api/equipment/categories").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));

        // 4. Locations -> KCE distinct locations
        mockMvc.perform(get("/api/equipment/locations").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));

        // 5. Initial Search -> ALL KCE equipment across all departments (inst 6)
        mockMvc.perform(get("/api/equipment/search").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(50))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))));
    }

    // =========================================================================
    // 2. PSG COLLEGE OF TECHNOLOGY (PSG - Institution ID 7)
    // =========================================================================

    @Test
    @DisplayName("PSG Student — Departments, Labs, Categories, Locations, Equipment all scoped to PSG (ID 7)")
    public void testPsgStudentFullFlow() throws Exception {
        UserPrincipal principal = getPrincipalForEmail("student.cse@psgtech.ac.in");
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        // 1. Departments -> only PSG (inst 7)
        mockMvc.perform(get("/api/departments/my-institution").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(7))));

        // 2. Laboratories -> all PSG labs (inst 7)
        mockMvc.perform(get("/api/laboratories").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(7))));

        // 3. Categories -> PSG distinct categories
        mockMvc.perform(get("/api/equipment/categories").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));

        // 4. Locations -> PSG distinct locations
        mockMvc.perform(get("/api/equipment/locations").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));

        // 5. Initial Search -> ALL PSG equipment across all departments (inst 7)
        mockMvc.perform(get("/api/equipment/search").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(50))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(7))));
    }

    // =========================================================================
    // 3. KUMARAGURU COLLEGE OF TECHNOLOGY (KCT - Institution ID 8)
    // =========================================================================

    @Test
    @DisplayName("Kumaraguru Student — Departments, Labs, Categories, Locations, Equipment all scoped to KCT (ID 8)")
    public void testKumaraguruStudentFullFlow() throws Exception {
        UserPrincipal principal = getPrincipalForEmail("student.cse@kct.ac.in");
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        // 1. Departments -> only Kumaraguru (inst 8)
        mockMvc.perform(get("/api/departments/my-institution").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(8))));

        // 2. Laboratories -> all Kumaraguru labs (inst 8)
        mockMvc.perform(get("/api/laboratories").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(8))));

        // 3. Categories -> Kumaraguru distinct categories
        mockMvc.perform(get("/api/equipment/categories").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));

        // 4. Locations -> Kumaraguru distinct locations
        mockMvc.perform(get("/api/equipment/locations").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));

        // 5. Initial Search -> ALL Kumaraguru equipment across all departments (inst 8)
        mockMvc.perform(get("/api/equipment/search").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(50))))
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(8))));
    }

    // =========================================================================
    // 4. CROSS-TENANT SECURITY & TAMPERING ATTACKS
    // =========================================================================

    @Test
    @DisplayName("Security: KCE student requesting PSG equipment ID via GET /api/equipment/{id} returns 403 Forbidden")
    public void testCrossTenantEquipmentAccessBlocked() throws Exception {
        UserPrincipal kcePrincipal = getPrincipalForEmail("student.it@kce.ac.in");
        UsernamePasswordAuthenticationToken kceAuth = new UsernamePasswordAuthenticationToken(kcePrincipal, null, kcePrincipal.getAuthorities());

        // Find a real PSG equipment ID (institution_id = 7)
        List<Equipment> psgEquipment = equipmentRepository.findByInstitutionId(7L);
        assertFalse(psgEquipment.isEmpty());
        Long psgEquipmentId = psgEquipment.get(0).getEquipmentId();

        // KCE student attempts to access PSG equipment
        mockMvc.perform(get("/api/equipment/" + psgEquipmentId).with(authentication(kceAuth)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Parameter Tampering ?institutionId=7 by KCE student is ignored and returns ONLY KCE equipment")
    public void testParameterTamperingIgnored() throws Exception {
        UserPrincipal kcePrincipal = getPrincipalForEmail("student.it@kce.ac.in");
        UsernamePasswordAuthenticationToken kceAuth = new UsernamePasswordAuthenticationToken(kcePrincipal, null, kcePrincipal.getAuthorities());

        mockMvc.perform(get("/api/equipment/search?institutionId=7").with(authentication(kceAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].institutionId", everyItem(equalTo(6))));
    }

    @Test
    @DisplayName("Security: KCE student requesting laboratories with PSG department ID returns empty list []")
    public void testForeignDepartmentLabRequestBlocked() throws Exception {
        UserPrincipal kcePrincipal = getPrincipalForEmail("student.it@kce.ac.in");
        UsernamePasswordAuthenticationToken kceAuth = new UsernamePasswordAuthenticationToken(kcePrincipal, null, kcePrincipal.getAuthorities());

        // PSG CSE departmentId = 28
        mockMvc.perform(get("/api/laboratories?departmentId=28").with(authentication(kceAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
