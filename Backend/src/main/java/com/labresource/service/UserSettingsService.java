package com.labresource.service;

import com.labresource.entity.User;
import com.labresource.entity.UserSettings;
import com.labresource.repository.UserRepository;
import com.labresource.repository.UserSettingsRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsRepository
            userSettingsRepository;

    private final UserRepository
            userRepository;


    // =====================================================
    // GET SETTINGS
    // =====================================================

    public UserSettings getSettings(
            Long userId
    ) {

        return userSettingsRepository
                .findByUserId(
                        userId
                )
                .orElseGet(
                        () -> createDefaultSettings(
                                userId
                        )
                );
    }


    // =====================================================
    // CREATE DEFAULT SETTINGS
    // =====================================================

    private UserSettings
    createDefaultSettings(
            Long userId
    ) {

        User user =
                userRepository
                        .findById(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        UserSettings settings =
                new UserSettings();

        settings.setUser(
                user
        );

        settings.setTheme(
                "dark"
        );

        settings.setCompactMode(
                false
        );

        settings.setEmailNotifications(
                true
        );

        settings.setBookingReminders(
                true
        );

        settings.setMaintenanceReminders(
                true
        );

        settings.setSystemNotifications(
                true
        );


        return userSettingsRepository.save(
                settings
        );
    }


    // =====================================================
    // UPDATE SETTINGS
    // =====================================================

    public UserSettings updateSettings(
            Long userId,
            UserSettings updatedSettings
    ) {

        UserSettings settings =
                getSettings(
                        userId
                );


        if (
                updatedSettings.getTheme()
                        != null
                        &&
                !updatedSettings.getTheme()
                        .isBlank()
        ) {

            settings.setTheme(
                    updatedSettings.getTheme()
            );
        }


        if (
                updatedSettings.getCompactMode()
                        != null
        ) {

            settings.setCompactMode(
                    updatedSettings
                            .getCompactMode()
            );
        }


        if (
                updatedSettings
                        .getEmailNotifications()
                        != null
        ) {

            settings.setEmailNotifications(
                    updatedSettings
                            .getEmailNotifications()
            );
        }


        if (
                updatedSettings
                        .getBookingReminders()
                        != null
        ) {

            settings.setBookingReminders(
                    updatedSettings
                            .getBookingReminders()
            );
        }


        if (
                updatedSettings
                        .getMaintenanceReminders()
                        != null
        ) {

            settings.setMaintenanceReminders(
                    updatedSettings
                            .getMaintenanceReminders()
            );
        }


        if (
                updatedSettings
                        .getSystemNotifications()
                        != null
        ) {

            settings.setSystemNotifications(
                    updatedSettings
                            .getSystemNotifications()
            );
        }


        return userSettingsRepository.save(
                settings
        );
    }


    // =====================================================
    // RESET SETTINGS
    // =====================================================

    public UserSettings resetSettings(
            Long userId
    ) {

        UserSettings settings =
                getSettings(
                        userId
                );


        settings.setTheme(
                "dark"
        );

        settings.setCompactMode(
                false
        );

        settings.setEmailNotifications(
                true
        );

        settings.setBookingReminders(
                true
        );

        settings.setMaintenanceReminders(
                true
        );

        settings.setSystemNotifications(
                true
        );


        return userSettingsRepository.save(
                settings
        );
    }
}