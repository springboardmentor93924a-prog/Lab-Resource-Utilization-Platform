import { useEffect, useState } from "react";
import { SettingsContext } from "./SettingsContext";

export function SettingsProvider({ children }) {

  // =========================================================
  // SETTINGS STATE
  // =========================================================

  const [theme, setTheme] = useState(
    localStorage.getItem("settings-theme") || "dark"
  );

  const [compactMode, setCompactMode] = useState(
    localStorage.getItem("settings-compact-mode") === "true"
  );

  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem("settings-email-notifications") !== "false"
  );

  const [bookingReminders, setBookingReminders] = useState(
    localStorage.getItem("settings-booking-reminders") !== "false"
  );

  const [maintenanceReminders, setMaintenanceReminders] = useState(
    localStorage.getItem("settings-maintenance-reminders") !== "false"
  );

  const [systemNotifications, setSystemNotifications] = useState(
    localStorage.getItem("settings-system-notifications") !== "false"
  );


  // =========================================================
  // SAVE THEME
  // =========================================================

  useEffect(() => {

    localStorage.setItem(
      "settings-theme",
      theme
    );

    document.body.classList.remove(
      "global-light-theme"
    );

    if (theme === "light") {
      document.body.classList.add(
        "global-light-theme"
      );
    }

  }, [theme]);


  // =========================================================
  // SAVE COMPACT MODE
  // =========================================================

  useEffect(() => {

    localStorage.setItem(
      "settings-compact-mode",
      compactMode
    );

    document.body.classList.toggle(
      "global-compact-mode",
      compactMode
    );

  }, [compactMode]);


  // =========================================================
  // SAVE NOTIFICATION SETTINGS
  // =========================================================

  useEffect(() => {

    localStorage.setItem(
      "settings-email-notifications",
      emailNotifications
    );

  }, [emailNotifications]);


  useEffect(() => {

    localStorage.setItem(
      "settings-booking-reminders",
      bookingReminders
    );

  }, [bookingReminders]);


  useEffect(() => {

    localStorage.setItem(
      "settings-maintenance-reminders",
      maintenanceReminders
    );

  }, [maintenanceReminders]);


  useEffect(() => {

    localStorage.setItem(
      "settings-system-notifications",
      systemNotifications
    );

  }, [systemNotifications]);


  // =========================================================
  // RESET SETTINGS
  // =========================================================

  function resetSettings() {

    setTheme("dark");
    setCompactMode(false);

    setEmailNotifications(true);
    setBookingReminders(true);
    setMaintenanceReminders(true);
    setSystemNotifications(true);

  }


  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = {

    theme,
    compactMode,

    emailNotifications,
    bookingReminders,
    maintenanceReminders,
    systemNotifications,

    setTheme,
    setCompactMode,

    setEmailNotifications,
    setBookingReminders,
    setMaintenanceReminders,
    setSystemNotifications,

    resetSettings,

  };


  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}