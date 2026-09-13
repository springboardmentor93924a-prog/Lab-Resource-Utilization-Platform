import {
  useEffect,
  useState,
} from "react";

import SettingsContext from "./SettingsContext";

import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
} from "../services/settingsService";


// =========================================================
// DEFAULT SETTINGS
// =========================================================

const defaultSettings = {

  theme: "dark",

  compactMode: false,

  emailNotifications: true,

  bookingReminders: true,

  maintenanceReminders: true,

  systemNotifications: true,

};


// =========================================================
// SETTINGS PROVIDER
// =========================================================

export function SettingsProvider({
  children,
}) {

  const [
    settings,
    setSettings,
  ] = useState(
    defaultSettings
  );


  const [
    loading,
    setLoading,
  ] = useState(
    false
  );


  // =======================================================
  // GET CURRENT USER
  // =======================================================

  const getCurrentUser =
    () => {

      const storedUser =
        localStorage.getItem(
          "user"
        );

      if (!storedUser) {
        return null;
      }

      try {

        return JSON.parse(
          storedUser
        );

      } catch (error) {

        console.error(
          "Invalid user data:",
          error
        );

        return null;
      }
    };


  // =======================================================
  // GET USER ID
  // =======================================================

  const getUserId =
    () => {

      const user =
        getCurrentUser();

      return (
        user?.id ??
        user?.userId ??
        null
      );
    };


  // =======================================================
  // NORMALIZE SETTINGS
  // =======================================================

  const normalizeSettings =
    (
      data
    ) => {

      return {

        theme:
          data?.theme ??
          defaultSettings.theme,

        compactMode:
          data?.compactMode ??
          defaultSettings.compactMode,

        emailNotifications:
          data?.emailNotifications ??
          defaultSettings.emailNotifications,

        bookingReminders:
          data?.bookingReminders ??
          defaultSettings.bookingReminders,

        maintenanceReminders:
          data?.maintenanceReminders ??
          defaultSettings.maintenanceReminders,

        systemNotifications:
          data?.systemNotifications ??
          defaultSettings.systemNotifications,

      };
    };


  // =======================================================
  // LOAD SETTINGS
  // =======================================================

  const loadSettings =
    async () => {

      const userId =
        getUserId();


      if (!userId) {

        setSettings(
          defaultSettings
        );

        return defaultSettings;
      }


      try {

        setLoading(
          true
        );


        const data =
          await getUserSettings(
            userId
          );


        const normalized =
          normalizeSettings(
            data
          );


        setSettings(
          normalized
        );


        return normalized;

      } catch (error) {

        console.error(
          "Failed to load user settings:",
          error
        );


        setSettings(
          defaultSettings
        );


        throw error;

      } finally {

        setLoading(
          false
        );
      }
    };


  // =======================================================
  // UPDATE SETTINGS
  // =======================================================

  const updateSettings =
    async (
      changes
    ) => {

      const newSettings = {

        ...settings,

        ...changes,

      };


      // Update UI immediately
      setSettings(
        newSettings
      );


      const userId =
        getUserId();


      if (!userId) {

        return newSettings;
      }


      try {

        const data =
          await updateUserSettings(
            userId,
            newSettings
          );


        const normalized =
          normalizeSettings(
            data
          );


        setSettings(
          normalized
        );


        return normalized;

      } catch (error) {

        console.error(
          "Failed to update settings:",
          error
        );


        // Restore previous settings
        setSettings(
          settings
        );


        throw error;
      }
    };


  // =======================================================
  // RESET SETTINGS
  // =======================================================

  const resetSettings =
    async () => {

      const userId =
        getUserId();


      if (!userId) {

        setSettings(
          defaultSettings
        );

        return defaultSettings;
      }


      try {

        setLoading(
          true
        );


        const data =
          await resetUserSettings(
            userId
          );


        const normalized =
          normalizeSettings(
            data
          );


        setSettings(
          normalized
        );


        return normalized;

      } catch (error) {

        console.error(
          "Failed to reset settings:",
          error
        );


        throw error;

      } finally {

        setLoading(
          false
        );
      }
    };


  // =======================================================
  // LOAD SETTINGS ON APPLICATION START
  // =======================================================

  useEffect(
    () => {

      loadSettings()
        .catch(
          () => {
            // Error already handled in loadSettings
          }
        );

    },
    []
  );


  // =======================================================
  // APPLY THEME
  // =======================================================

  useEffect(
    () => {

      document.documentElement.setAttribute(
        "data-theme",
        settings.theme
      );


      document.body.classList.toggle(
        "dark-theme",
        settings.theme === "dark"
      );


      document.body.classList.toggle(
        "light-theme",
        settings.theme === "light"
      );

    },
    [
      settings.theme,
    ]
  );


  // =======================================================
  // APPLY COMPACT MODE
  // =======================================================

  useEffect(
    () => {

      document.body.classList.toggle(
        "compact-mode",
        Boolean(
          settings.compactMode
        )
      );

    },
    [
      settings.compactMode,
    ]
  );


  // =======================================================
  // INDIVIDUAL CONVENIENCE FUNCTIONS
  // =======================================================

  const setTheme =
    (
      theme
    ) =>
      updateSettings(
        {
          theme,
        }
      );


  const setCompactMode =
    (
      compactMode
    ) =>
      updateSettings(
        {
          compactMode,
        }
      );


  const setEmailNotifications =
    (
      emailNotifications
    ) =>
      updateSettings(
        {
          emailNotifications,
        }
      );


  const setBookingReminders =
    (
      bookingReminders
    ) =>
      updateSettings(
        {
          bookingReminders,
        }
      );


  const setMaintenanceReminders =
    (
      maintenanceReminders
    ) =>
      updateSettings(
        {
          maintenanceReminders,
        }
      );


  const setSystemNotifications =
    (
      systemNotifications
    ) =>
      updateSettings(
        {
          systemNotifications,
        }
      );


  // =======================================================
  // CONTEXT VALUE
  // =======================================================

  const value = {

    // Complete settings object
    settings,

    // Individual settings
    theme:
      settings.theme,

    compactMode:
      settings.compactMode,

    emailNotifications:
      settings.emailNotifications,

    bookingReminders:
      settings.bookingReminders,

    maintenanceReminders:
      settings.maintenanceReminders,

    systemNotifications:
      settings.systemNotifications,


    // Loading
    loading,


    // Main actions
    loadSettings,

    updateSettings,

    resetSettings,


    // Individual actions
    setTheme,

    setCompactMode,

    setEmailNotifications,

    setBookingReminders,

    setMaintenanceReminders,

    setSystemNotifications,

  };


  return (

    <SettingsContext.Provider
      value={value}
    >

      {children}

    </SettingsContext.Provider>

  );
}