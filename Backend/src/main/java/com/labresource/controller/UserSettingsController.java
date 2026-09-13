package com.labresource.controller;

import com.labresource.entity.UserSettings;
import com.labresource.service.UserSettingsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(
        "/api/settings"
)
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://localhost:5173"
)
public class UserSettingsController {

    private final UserSettingsService
            userSettingsService;


    // =====================================================
    // GET USER SETTINGS
    // =====================================================

    @GetMapping(
            "/user/{userId}"
    )
    public ResponseEntity<UserSettings>
    getSettings(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                userSettingsService
                        .getSettings(
                                userId
                        )
        );
    }


    // =====================================================
    // UPDATE USER SETTINGS
    // =====================================================

    @PutMapping(
            "/user/{userId}"
    )
    public ResponseEntity<UserSettings>
    updateSettings(
            @PathVariable Long userId,

            @RequestBody
            UserSettings settings
    ) {

        return ResponseEntity.ok(
                userSettingsService
                        .updateSettings(
                                userId,
                                settings
                        )
        );
    }


    // =====================================================
    // RESET USER SETTINGS
    // =====================================================

    @PostMapping(
            "/user/{userId}/reset"
    )
    public ResponseEntity<UserSettings>
    resetSettings(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                userSettingsService
                        .resetSettings(
                                userId
                        )
        );
    }
}