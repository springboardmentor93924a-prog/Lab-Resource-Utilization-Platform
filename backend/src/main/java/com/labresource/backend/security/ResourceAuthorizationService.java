package com.labresource.backend.security;

import com.labresource.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceAuthorizationService {

    /**
     * Checks if the principal has a department-scoped role:
     * LAB_TECHNICIAN, LAB_MANAGER, or DEPARTMENT_HEAD
     * (and does NOT have SYSTEM_ADMIN or INSTITUTION_ADMIN privileges).
     */
    public boolean isDepartmentScopedRole(UserPrincipal principal) {
        if (principal == null) {
            return false;
        }
        List<String> roles = principal.getRoleNames();
        if (roles == null || roles.isEmpty()) {
            return false;
        }
        boolean hasAdmin = roles.stream().anyMatch(r -> 
            "SYSTEM_ADMIN".equalsIgnoreCase(r) || "ROLE_SYSTEM_ADMIN".equalsIgnoreCase(r) ||
            "INSTITUTION_ADMIN".equalsIgnoreCase(r) || "ROLE_INSTITUTION_ADMIN".equalsIgnoreCase(r)
        );
        if (hasAdmin) {
            return false;
        }
        return roles.stream().anyMatch(r ->
            "LAB_TECHNICIAN".equalsIgnoreCase(r) || "ROLE_LAB_TECHNICIAN".equalsIgnoreCase(r) ||
            "LAB_MANAGER".equalsIgnoreCase(r) || "ROLE_LAB_MANAGER".equalsIgnoreCase(r) ||
            "DEPARTMENT_HEAD".equalsIgnoreCase(r) || "ROLE_DEPARTMENT_HEAD".equalsIgnoreCase(r)
        );
    }

    /**
     * Resolves the effective department ID for filtering.
     * For department-scoped roles:
     * - Returns principal.getDepartmentId() if present.
     * - Returns -1L (sentinel for no match) if principal.getDepartmentId() is null.
     * - Strictly IGNORES any client-provided requestedDepartmentId.
     * For admin / other roles:
     * - Returns requestedDepartmentId.
     */
    public Long resolveEffectiveDepartmentId(UserPrincipal principal, Long requestedDepartmentId) {
        if (isDepartmentScopedRole(principal)) {
            Long deptId = principal.getDepartmentId();
            return deptId != null ? deptId : -1L;
        }
        return requestedDepartmentId;
    }

    /**
     * Resolves the effective institution ID for filtering.
     * For non-SYSTEM_ADMIN roles:
     * - Returns principal.getInstitutionId() (or -1L if null).
     * - Strictly IGNORES any client-provided requestedInstitutionId.
     */
    public Long resolveEffectiveInstitutionId(UserPrincipal principal, Long requestedInstitutionId) {
        if (principal == null) {
            return requestedInstitutionId;
        }
        List<String> roles = principal.getRoleNames();
        if (roles != null && roles.stream().anyMatch(r -> "SYSTEM_ADMIN".equalsIgnoreCase(r) || "ROLE_SYSTEM_ADMIN".equalsIgnoreCase(r))) {
            return requestedInstitutionId;
        }
        Long instId = principal.getInstitutionId();
        return instId != null ? instId : -1L;
    }

    /**
     * Enforces that the principal is authorized to access the given equipment / laboratory resource.
     * 1. Institution check:
     *    If principal has an institution ID, resource's institution ID must match.
     * 2. Department check:
     *    If principal has a department-scoped role:
     *    - Principal's department ID must not be null.
     *    - Resource's department ID must match principal's department ID.
     * Throws ApiException(HttpStatus.FORBIDDEN) on violation.
     */
    public void authorizeResourceAccess(UserPrincipal principal, Long resourceInstitutionId, Long resourceDepartmentId) {
        if (principal == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Authentication required.");
        }

        List<String> roles = principal.getRoleNames();
        boolean isSystemAdmin = roles != null && roles.stream().anyMatch(r -> 
            "SYSTEM_ADMIN".equalsIgnoreCase(r) || "ROLE_SYSTEM_ADMIN".equalsIgnoreCase(r)
        );
        if (isSystemAdmin) {
            return;
        }

        Long userInstId = principal.getInstitutionId();
        if (userInstId == null || !userInstId.equals(resourceInstitutionId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorised to access resources outside your institution.");
        }

        if (isDepartmentScopedRole(principal)) {
            Long userDeptId = principal.getDepartmentId();
            if (userDeptId == null || !userDeptId.equals(resourceDepartmentId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorised to access resources outside your department.");
            }
        }
    }
}
