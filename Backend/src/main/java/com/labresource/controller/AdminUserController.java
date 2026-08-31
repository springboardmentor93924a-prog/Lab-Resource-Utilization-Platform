
package com.labresource.controller;

import com.labresource.dto.CreateUserRequest;
import com.labresource.entity.User;
import com.labresource.service.AdminUserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")

@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(
            AdminUserService adminUserService) {

        this.adminUserService = adminUserService;
    }

    // =========================================================
    // CREATE ADMINISTRATIVE USER
    //
    // SYSTEM_ADMIN       -> INSTITUTION_ADMIN
    // INSTITUTION_ADMIN  -> DEPARTMENT_HEAD
    // DEPARTMENT_HEAD    -> LAB_MANAGER
    // LAB_MANAGER        -> LAB_TECHNICIAN
    //
    // The AdminUserService checks which target role
    // each logged-in role is actually allowed to create.
    // =========================================================

    @PostMapping

    @PreAuthorize("""
        hasAnyRole(
            'SYSTEM_ADMIN',
            'INSTITUTION_ADMIN',
            'DEPARTMENT_HEAD',
            'LAB_MANAGER'
        )
    """)

    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request,
            Authentication authentication) {

        try {

            User user =
                    adminUserService.createUser(
                            request,
                            authentication
                    );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "User created successfully."
            );

            response.put(
                    "userId",
                    user.getId()
            );

            response.put(
                    "fullName",
                    user.getFullName()
            );

            response.put(
                    "email",
                    user.getEmail()
            );

            response.put(
                    "role",
                    user.getRole()
            );

            if (user.getInstitution() != null) {

                response.put(
                        "institutionId",
                        user.getInstitution().getId()
                );
            }

            if (user.getDepartment() != null) {

                response.put(
                        "departmentId",
                        user.getDepartment().getId()
                );
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to create user: "
                                    + e.getMessage()
                    );
        }
    }


    @GetMapping("/technicians")
@PreAuthorize("""
    hasAnyRole(
        'SYSTEM_ADMIN',
        'INSTITUTION_ADMIN',
        'DEPARTMENT_HEAD',
        'LAB_MANAGER'
    )
""")
public ResponseEntity<?> getTechnicians() {

    try {

        return ResponseEntity.ok(
                adminUserService.getTechnicians()
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());

    } catch (Exception e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        "Unable to load technicians: "
                                + e.getMessage()
                );
    }
}
    
}
