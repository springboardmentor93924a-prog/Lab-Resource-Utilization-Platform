package com.example.lab_platform.controller;

import com.example.lab_platform.entity.User;
import com.example.lab_platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * "My profile" - available to every logged-in role (no @PreAuthorize
 * role list: the security config already requires a valid token for
 * /api/**, and the service only ever touches the caller's own record).
 */
@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    private Map<String, Object> toProfile(User user) {

        Map<String, Object> profile = new HashMap<>();

        profile.put("userId", user.getUserId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole() != null ? user.getRole().getRoleName() : null);
        profile.put("institutionName",
                user.getInstitution() != null ? user.getInstitution().getInstitutionName() : null);
        profile.put("departmentName",
                user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null);
        profile.put("status", user.getStatus());
        profile.put("createdAt", user.getCreatedAt());

        return profile;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile() {
        return ResponseEntity.ok(toProfile(userService.getMyProfile()));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> body) {

        User updated = userService.updateMyProfile(
                body.get("fullName"),
                body.get("phone")
        );

        return ResponseEntity.ok(toProfile(updated));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> body) {

        userService.changeMyPassword(
                body.get("currentPassword"),
                body.get("newPassword")
        );

        Map<String, String> result = new HashMap<>();
        result.put("message", "Password changed successfully");

        return ResponseEntity.ok(result);
    }
}