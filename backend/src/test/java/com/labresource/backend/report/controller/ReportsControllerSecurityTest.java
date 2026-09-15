package com.labresource.backend.report.controller;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ReportsControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    private UserPrincipal createPrincipal(Long userId, Long instId, Long deptId, String roleName) {
        AppUser user = new AppUser();
        user.setUserId(userId);
        user.setInstitutionId(instId);
        user.setDepartmentId(deptId);
        user.setEmail("user" + userId + "@test.com");
        user.setIsActive(true);

        Role role = new Role();
        role.setRoleId(100L);
        role.setRoleName(roleName);
        role.setPermissions(Set.of());

        user.setRoles(Set.of(role));
        return new UserPrincipal(user);
    }

    private UsernamePasswordAuthenticationToken getAuth(UserPrincipal principal) {
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("A. LAB_MANAGER can access /utilization-effectiveness and its export endpoints")
    public void testLabManager_CanAccessUtilizationEffectivenessAndExports() throws Exception {
        UserPrincipal principal = createPrincipal(101L, 6L, 10L, "LAB_MANAGER");
        mockMvc.perform(get("/api/reports/utilization-effectiveness")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/reports/utilization-effectiveness/export/pdf")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PDF_VALUE));

        mockMvc.perform(get("/api/reports/utilization-effectiveness/export/excel")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/reports/utilization-effectiveness/export/csv")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("B. LAB_MANAGER cannot access /cost-analysis or cost exports (403 FORBIDDEN)")
    public void testLabManager_CannotAccessCostAnalysisOrExports() throws Exception {
        UserPrincipal principal = createPrincipal(101L, 6L, 10L, "LAB_MANAGER");
        mockMvc.perform(get("/api/reports/cost-analysis")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/cost-analysis/export/pdf")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/cost-analysis/export/excel")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/cost-analysis/export/csv")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("C. DEPARTMENT_HEAD can access both reports and all export endpoints")
    public void testDeptHead_CanAccessBothReportsAndExports() throws Exception {
        UserPrincipal principal = createPrincipal(102L, 6L, 10L, "DEPARTMENT_HEAD");
        mockMvc.perform(get("/api/reports/utilization-effectiveness/export/pdf")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/reports/cost-analysis/export/pdf")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/reports/cost-analysis/export/excel")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("D. INSTITUTION_ADMIN can access both reports and all export endpoints")
    public void testInstAdmin_CanAccessBothReportsAndExports() throws Exception {
        UserPrincipal principal = createPrincipal(103L, 6L, null, "INSTITUTION_ADMIN");
        mockMvc.perform(get("/api/reports/utilization-effectiveness/export/pdf")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/reports/cost-analysis/export/excel")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/reports/cost-analysis/export/csv")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("E. RESEARCHER cannot access report exports (403 FORBIDDEN)")
    public void testResearcher_CannotAccessExports() throws Exception {
        UserPrincipal principal = createPrincipal(104L, 6L, 10L, "RESEARCHER");
        mockMvc.perform(get("/api/reports/utilization-effectiveness/export/pdf")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/cost-analysis/export/pdf")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("F. SYSTEM_ADMIN cannot access report exports (403 FORBIDDEN)")
    public void testSystemAdmin_CannotAccessExports() throws Exception {
        UserPrincipal principal = createPrincipal(105L, null, null, "SYSTEM_ADMIN");
        mockMvc.perform(get("/api/reports/utilization-effectiveness/export/excel")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/cost-analysis/export/excel")
                        .with(authentication(getAuth(principal))))
                .andExpect(status().isForbidden());
    }
}
