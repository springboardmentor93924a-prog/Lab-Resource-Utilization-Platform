import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/useSettings";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const {
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
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);

  function handleReset() {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings?"
    );

    if (!confirmed) return;

    resetSettings();
  }

  return (
    <div className="sidebar-settings">

      {/* =====================================================
          SETTINGS SIDEBAR ITEM
      ===================================================== */}

      <button
        type="button"
        className={`sidebar-settings-button ${
          isOpen ? "active" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Settings"
        aria-label="Settings"
        aria-expanded={isOpen}
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

          {/* HEADER */}

          <div className="sidebar-settings-header">

            <div>
              <h4>Settings</h4>

              <p>
                Customize your preferences
              </p>
            </div>

            <button
              type="button"
              className="sidebar-settings-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close settings"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>


          {/* =================================================
              APPEARANCE
          ================================================= */}

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
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value)
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
                  checked={compactMode}
                  onChange={(e) =>
                    setCompactMode(
                      e.target.checked
                    )
                  }
                />

                <span className="sidebar-settings-slider"></span>

              </label>

            </div>

          </div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

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
                  checked={emailNotifications}
                  onChange={(e) =>
                    setEmailNotifications(
                      e.target.checked
                    )
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
                  checked={bookingReminders}
                  onChange={(e) =>
                    setBookingReminders(
                      e.target.checked
                    )
                  }
                />

                <span className="sidebar-settings-slider"></span>

              </label>

            </div>


            {/* MAINTENANCE */}

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
                  checked={maintenanceReminders}
                  onChange={(e) =>
                    setMaintenanceReminders(
                      e.target.checked
                    )
                  }
                />

                <span className="sidebar-settings-slider"></span>

              </label>

            </div>


            {/* SYSTEM */}

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
                  checked={systemNotifications}
                  onChange={(e) =>
                    setSystemNotifications(
                      e.target.checked
                    )
                  }
                />

                <span className="sidebar-settings-slider"></span>

              </label>

            </div>

          </div>


          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="sidebar-settings-section">

            <h5>
              <i className="bi bi-person-fill"></i>
              Account
            </h5>

            <button
              type="button"
              className="sidebar-settings-profile"
              onClick={() => {
                setIsOpen(false);
                navigate("/profile");
              }}
            >

              <span>
                <i className="bi bi-person-circle"></i>

                My Profile
              </span>

              <i className="bi bi-chevron-right"></i>

            </button>

          </div>


          {/* =================================================
              RESET
          ================================================= */}

          <div className="sidebar-settings-footer">

            <button
              type="button"
              className="sidebar-settings-reset"
              onClick={handleReset}
            >
              <i className="bi bi-arrow-counterclockwise"></i>

              Reset Settings
            </button>

          </div>

        </div>
      )}

    </div>
  );
}