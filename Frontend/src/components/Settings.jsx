import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useSettings,
} from "../context/useSettings";

import "./Settings.css";


export default function Settings() {

  const navigate =
    useNavigate();


  /* =====================================================
     SETTINGS CONTEXT
  ===================================================== */

  const {

  settings,

  loading,

  updateSettings,

  resetSettings,

  loadSettings,

} = useSettings();


  /* =====================================================
     LOCAL STATE
  ===================================================== */

  const [
    isOpen,
    setIsOpen,
  ] = useState(
    false
  );


  const [
    saving,
    setSaving,
  ] = useState(
    false
  );


  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    ""
  );


  const [
    errorMessage,
    setErrorMessage,
  ] = useState(
    ""
  );


  /* =====================================================
     DEFAULT VALUES
  ===================================================== */

  const theme =
    settings?.theme ??
    "dark";


  const compactMode =
    Boolean(
      settings?.compactMode
    );


  const emailNotifications =
    settings?.emailNotifications ??
    true;


  const bookingReminders =
    settings?.bookingReminders ??
    true;


  const maintenanceReminders =
    settings?.maintenanceReminders ??
    true;


  const systemNotifications =
    settings?.systemNotifications ??
    true;


  /* =====================================================
     LOAD SETTINGS WHEN PANEL OPENS
  ===================================================== */

  useEffect(
    () => {

      if (
        isOpen
      ) {

        loadSettings();

      }

    },
    [
      isOpen,
    ]
  );


  /* =====================================================
     AUTO CLEAR SUCCESS MESSAGE
  ===================================================== */

  useEffect(
    () => {

      if (
        !successMessage
      ) {
        return;
      }


      const timeout =
        setTimeout(
          () => {

            setSuccessMessage(
              ""
            );

          },
          3000
        );


      return () => {

        clearTimeout(
          timeout
        );

      };

    },
    [
      successMessage,
    ]
  );


  /* =====================================================
     UPDATE ONE SETTING
  ===================================================== */

  const handleSettingChange =
    async (
      changes
    ) => {

      try {

        setSaving(
          true
        );


        setErrorMessage(
          ""
        );


        setSuccessMessage(
          ""
        );


        await updateSettings(
          changes
        );


        setSuccessMessage(
          "Settings saved successfully"
        );

      } catch (
        error
      ) {

        console.error(
          "Failed to save settings:",
          error
        );


        setErrorMessage(
          error?.response?.data?.message ||
          "Failed to save settings"
        );

      } finally {

        setSaving(
          false
        );
      }
    };


  /* =====================================================
     RESET SETTINGS
  ===================================================== */

  const handleReset =
  async () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to reset all settings?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setSaving(
        true
      );


      setErrorMessage(
        ""
      );


      setSuccessMessage(
        ""
      );


      await resetSettings();


      setSuccessMessage(
        "Settings reset successfully"
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to reset settings:",
        error
      );


      setErrorMessage(
        error?.response?.data?.message ||
        "Failed to reset settings"
      );

    } finally {

      setSaving(
        false
      );
    }
  };


  return (

    <div className="sidebar-settings">


      {/* =====================================================
          SETTINGS SIDEBAR ITEM
      ===================================================== */}

      <button
        type="button"
        className={`sidebar-settings-button ${
          isOpen
            ? "active"
            : ""
        }`}
        onClick={
          () =>
            setIsOpen(
              (previous) =>
                !previous
            )
        }
        title="Settings"
        aria-label="Settings"
        aria-expanded={
          isOpen
        }
      >

        <span className="sidebar-settings-content">

          <i className="bi bi-gear-fill"></i>

          <span>
            Settings
          </span>

        </span>

      </button>


      {/* =====================================================
          SETTINGS PANEL
      ===================================================== */}

      {isOpen && (

        <div className="sidebar-settings-panel">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="sidebar-settings-header">

            <div>

              <h4>
                Settings
              </h4>

              <p>
                Customize your preferences
              </p>

            </div>


            <button
              type="button"
              className="sidebar-settings-close"
              onClick={
                () =>
                  setIsOpen(
                    false
                  )
              }
              aria-label="Close settings"
            >

              <i className="bi bi-x-lg"></i>

            </button>

          </div>


          {/* =================================================
              STATUS MESSAGES
          ================================================= */}

          {successMessage && (

            <div className="settings-success-message">

              <i className="bi bi-check-circle-fill"></i>

              <span>
                {successMessage}
              </span>

            </div>

          )}


          {errorMessage && (

            <div className="settings-error-message">

              <i className="bi bi-exclamation-circle-fill"></i>

              <span>
                {errorMessage}
              </span>

            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="settings-loading">

              <div className="settings-spinner"></div>

              <span>
                Loading settings...
              </span>

            </div>

          ) : (

            <>


              {/* =============================================
                  APPEARANCE
              ============================================= */}

              <div className="sidebar-settings-section">

                <h5>

                  <i className="bi bi-palette-fill"></i>

                  Appearance

                </h5>


                {/* THEME */}

                <div className="sidebar-settings-row">

                  <div className="sidebar-settings-info">

                    <strong>
                      Theme
                    </strong>

                    <span>
                      Choose light or dark theme
                    </span>

                  </div>


                  <select
                    className="sidebar-settings-select"
                    value={
                      theme
                    }
                    disabled={
                      saving
                    }
                    onChange={
                      (event) =>
                        handleSettingChange({

                          theme:
                            event.target.value,

                        })
                    }
                  >

                    <option value="dark">
                      Dark
                    </option>

                    <option value="light">
                      Light
                    </option>

                  </select>

                </div>


                {/* COMPACT MODE */}

                <div className="sidebar-settings-row">

                  <div className="sidebar-settings-info">

                    <strong>
                      Compact mode
                    </strong>

                    <span>
                      Use a more compact layout
                    </span>

                  </div>


                  <label className="sidebar-settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        compactMode
                      }
                      disabled={
                        saving
                      }
                      onChange={
                        (event) =>
                          handleSettingChange({

                            compactMode:
                              event.target.checked,

                          })
                      }
                    />

                    <span className="sidebar-settings-slider"></span>

                  </label>

                </div>

              </div>


              {/* =============================================
                  NOTIFICATIONS
              ============================================= */}

              <div className="sidebar-settings-section">

                <h5>

                  <i className="bi bi-bell-fill"></i>

                  Notifications

                </h5>


                {/* EMAIL */}

                <div className="sidebar-settings-row">

                  <div className="sidebar-settings-info">

                    <strong>
                      Email notifications
                    </strong>

                    <span>
                      Receive notifications by email
                    </span>

                  </div>


                  <label className="sidebar-settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        emailNotifications
                      }
                      disabled={
                        saving
                      }
                      onChange={
                        (event) =>
                          handleSettingChange({

                            emailNotifications:
                              event.target.checked,

                          })
                      }
                    />

                    <span className="sidebar-settings-slider"></span>

                  </label>

                </div>


                {/* BOOKING REMINDERS */}

                <div className="sidebar-settings-row">

                  <div className="sidebar-settings-info">

                    <strong>
                      Booking reminders
                    </strong>

                    <span>
                      Reminders for upcoming bookings
                    </span>

                  </div>


                  <label className="sidebar-settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        bookingReminders
                      }
                      disabled={
                        saving
                      }
                      onChange={
                        (event) =>
                          handleSettingChange({

                            bookingReminders:
                              event.target.checked,

                          })
                      }
                    />

                    <span className="sidebar-settings-slider"></span>

                  </label>

                </div>


                {/* MAINTENANCE REMINDERS */}

                <div className="sidebar-settings-row">

                  <div className="sidebar-settings-info">

                    <strong>
                      Maintenance reminders
                    </strong>

                    <span>
                      Receive maintenance alerts
                    </span>

                  </div>


                  <label className="sidebar-settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        maintenanceReminders
                      }
                      disabled={
                        saving
                      }
                      onChange={
                        (event) =>
                          handleSettingChange({

                            maintenanceReminders:
                              event.target.checked,

                          })
                      }
                    />

                    <span className="sidebar-settings-slider"></span>

                  </label>

                </div>


                {/* SYSTEM NOTIFICATIONS */}

                <div className="sidebar-settings-row">

                  <div className="sidebar-settings-info">

                    <strong>
                      System notifications
                    </strong>

                    <span>
                      Important system alerts
                    </span>

                  </div>


                  <label className="sidebar-settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        systemNotifications
                      }
                      disabled={
                        saving
                      }
                      onChange={
                        (event) =>
                          handleSettingChange({

                            systemNotifications:
                              event.target.checked,

                          })
                      }
                    />

                    <span className="sidebar-settings-slider"></span>

                  </label>

                </div>

              </div>


              {/* =============================================
                  ACCOUNT
              ============================================= */}

              <div className="sidebar-settings-section">

                <h5>

                  <i className="bi bi-person-fill"></i>

                  Account

                </h5>


                <button
                  type="button"
                  className="sidebar-settings-profile"
                  onClick={
                    () => {

                      setIsOpen(
                        false
                      );


                      navigate(
                        "/profile"
                      );

                    }
                  }
                >

                  <span>

                    <i className="bi bi-person-circle"></i>

                    My Profile

                  </span>


                  <i className="bi bi-chevron-right"></i>

                </button>

              </div>


              {/* =============================================
                  RESET
              ============================================= */}

              <div className="sidebar-settings-footer">

                <button
                  type="button"
                  className="sidebar-settings-reset"
                  disabled={
                    saving
                  }
                  onClick={
                    handleReset
                  }
                >

                  <i className="bi bi-arrow-counterclockwise"></i>

                  {saving
                    ? "Saving..."
                    : "Reset Settings"}

                </button>

              </div>


            </>

          )}

        </div>

      )}

    </div>

  );
}