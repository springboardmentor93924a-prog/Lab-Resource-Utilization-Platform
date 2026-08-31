import React, { useState, useEffect } from "react";
import "./Notifications.css";

const allMockNotifications = [
  // 1. RESEARCHER / STUDENT
  { id: "NOTIF-01", role: "RESEARCHER", type: "booking", title: "Booking Confirmed", message: "Your booking for 3D Printer (EQ003) on Aug 31 is confirmed.", time: "1 hour ago", unread: true },
  { id: "NOTIF-02", role: "RESEARCHER", type: "waitlist", title: "Waitlist Slot Available", message: "A slot has opened up for Spectrometer (EQ005). Click to book.", time: "3 hours ago", unread: true },
  { id: "NOTIF-03", role: "RESEARCHER", type: "booking", title: "Booking Reminder", message: "Upcoming session for Oscilloscope (EQ001) starts tomorrow at 10:00 AM.", time: "5 hours ago", unread: false },

  // 2. LAB TECHNICIAN
  { id: "NOTIF-04", role: "LAB_TECHNICIAN", type: "maintenance", title: "Work Order Assigned", message: "You have been assigned to service CNC Machine (EQ004).", time: "20 mins ago", unread: true },
  { id: "NOTIF-05", role: "LAB_TECHNICIAN", type: "calibration", title: "Calibration Due", message: "Multimeter (EQ002) requires routine calibration check.", time: "2 hours ago", unread: true },

  // 3. LAB MANAGER
  { id: "NOTIF-06", role: "LAB_MANAGER", type: "maintenance", title: "Maintenance Due Alert", message: "CNC Machine (EQ004) scheduled maintenance is due tomorrow.", time: "10 mins ago", unread: true },
  { id: "NOTIF-07", role: "LAB_MANAGER", type: "calibration", title: "Calibration Expiry Warning", message: "Oscilloscope (EQ001) calibration expires in 3 days.", time: "30 mins ago", unread: true },
  { id: "NOTIF-08", role: "LAB_MANAGER", type: "idle", title: "Idle Equipment Alert", message: "Digital Multimeter (EQ002) has been idle for over 48 hours.", time: "1 day ago", unread: false },
  { id: "NOTIF-09", role: "LAB_MANAGER", type: "sharing", title: "Resource Sharing Request", message: "Central Science University requested 32 hours on Spectrometer.", time: "2 days ago", unread: false },

  // 4. DEPARTMENT HEAD
  { id: "NOTIF-10", role: "DEPARTMENT_HEAD", type: "sharing", title: "Inter-Department Billing Action", message: "Monthly cost allocation report ready for review across Mechanical & ECE.", time: "4 hours ago", unread: true },
  { id: "NOTIF-11", role: "DEPARTMENT_HEAD", type: "maintenance", title: "High Downtime Warning", message: "ECE Department equipment downtime exceeded 15% threshold this week.", time: "1 day ago", unread: true },

  // 5. INSTITUTION ADMIN
  { id: "NOTIF-12", role: "INSTITUTION_ADMIN", type: "sharing", title: "Inter-Institution Agreement", message: "New sharing partnership request from Apex Tech Labs needs institutional sign-off.", time: "3 hours ago", unread: true },
  { id: "NOTIF-13", role: "INSTITUTION_ADMIN", type: "cost", title: "Procurement Insight", message: "High demand detected for 3D Printers across 3 departments. Consider budget expansion.", time: "2 days ago", unread: false },

  // 6. SYSTEM ADMIN
  { id: "NOTIF-14", role: "SYSTEM_ADMIN", type: "system", title: "System Audit & Security Alert", message: "User permissions updated for 5 new Lab Managers.", time: "30 mins ago", unread: true },
  { id: "NOTIF-15", role: "SYSTEM_ADMIN", type: "system", title: "Database Sync Complete", message: "Milestone 3 usage metrics successfully integrated.", time: "6 hours ago", unread: false }
];

function Notifications({ userRole = "RESEARCHER", showToast }) {
  const [notifications, setNotifications] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const roleFilteredNotifs = allMockNotifications.filter(item => {
      if (userRole === "SYSTEM_ADMIN") return true;
      return item.role === userRole;
    });
    setNotifications(roleFilteredNotifs);
    setActiveCategory("all");
  }, [userRole]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    if (showToast) showToast("All notifications marked as read", "success");
  };

  const toggleRead = (id) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id) {
          const updatedUnread = !n.unread;
          if (showToast) {
            showToast(
              updatedUnread ? "Notification marked as unread" : "Notification marked as read",
              "info"
            );
          }
          return { ...n, unread: updatedUnread };
        }
        return n;
      })
    );
  };

  const deleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (showToast) showToast("Notification deleted", "warning");
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeCategory === "all") return true;
    if (activeCategory === "unread") return n.unread;
    return n.type === activeCategory;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const getRoleCategories = () => {
    switch (userRole) {
      case "RESEARCHER":
        return [
          { id: "booking", label: "Bookings" },
          { id: "waitlist", label: "Waitlist" }
        ];
      case "LAB_TECHNICIAN":
        return [
          { id: "maintenance", label: "Work Orders" },
          { id: "calibration", label: "Calibrations" }
        ];
      case "LAB_MANAGER":
        return [
          { id: "maintenance", label: "Maintenance" },
          { id: "calibration", label: "Calibration" },
          { id: "sharing", label: "Sharing Requests" },
          { id: "idle", label: "Idle Equipment" }
        ];
      case "DEPARTMENT_HEAD":
        return [
          { id: "sharing", label: "Inter-Dept Billing" },
          { id: "maintenance", label: "Downtime Alerts" }
        ];
      case "INSTITUTION_ADMIN":
        return [
          { id: "sharing", label: "Agreements" },
          { id: "cost", label: "Procurement Insights" }
        ];
      case "SYSTEM_ADMIN":
      default:
        return [
          { id: "system", label: "System Logs" },
          { id: "maintenance", label: "Maintenance" },
          { id: "booking", label: "Bookings" },
          { id: "sharing", label: "Sharing" }
        ];
    }
  };

  return (
    <div className="notifications-page">
      <div className="notif-header">
        <div>
          <span className="notif-eyebrow">Milestone 3 Task 6</span>
          <h1>Notification & Alert Center</h1>
          <p>Real-time updates tailored for <strong>{userRole}</strong></p>
        </div>
        <div className="notif-actions">
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
              ✓ Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Category Filter Pills */}
      <div className="notif-filter-bar">
        {[
          { id: "all", label: "All Alerts" },
          { id: "unread", label: `Unread (${unreadCount})` },
          ...getRoleCategories()
        ].map(cat => (
          <button
            key={cat.id}
            className={`notif-tab ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notifications Cards */}
      <div className="notif-list-container">
        {filteredNotifs.length === 0 ? (
          <div className="notif-empty">No notifications found for this category.</div>
        ) : (
          filteredNotifs.map((item) => (
            <div key={item.id} className={`notif-card ${item.unread ? "unread" : ""}`}>
              <div className={`notif-badge ${item.type}`}>
                {item.type.charAt(0).toUpperCase()}
              </div>
              <div className="notif-content">
                <div className="notif-top">
                  <strong>{item.title}</strong>
                  <span className="notif-time">{item.time}</span>
                </div>
                <p>{item.message}</p>
              </div>
              <div className="notif-item-actions">
                <button className="icon-btn" onClick={() => toggleRead(item.id)}>
                  {item.unread ? "Mark Read" : "Mark Unread"}
                </button>
                <button className="icon-btn delete" onClick={() => deleteNotif(item.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;