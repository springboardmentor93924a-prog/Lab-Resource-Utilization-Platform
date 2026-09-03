import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Navbar() {
    const nav = useNavigate();
    const { 
        user, logout,
        isResearcher,
        isSystemAdmin, isInstitutionAdmin, isDepartmentHead, isLabManager, isLabTechnician
    } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    const timeAgo = (createdAt) => {
        if (!createdAt) return "";
        const diffMs = Date.now() - new Date(createdAt).getTime();
        const minutes = Math.floor(diffMs / 60000);
        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Attach relative-time text when data arrives so render stays pure
    const withTimeAgo = (list) =>
        (list || []).map(n => ({ ...n, timeAgoText: timeAgo(n.createdAt) }));

    useEffect(() => {
        api.get("/notifications/me")
            .then(res => setNotifications(withTimeAgo(res.data)))
            .catch(err => console.error(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id) => {
        api.patch(`/notifications/${id}/read`)
            .then(() => {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
            })
            .catch(err => console.error(err));
    };

    const markAllAsRead = () => {
        api.patch("/notifications/read-all")
            .then(() => {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            })
            .catch(err => console.error(err));
    };

    const handleLogout = () => {
        logout();
        nav('/login');
    };

    const name = user?.name || "User";

    return (
        <header className="app-navbar">
            <NavLink to="/" className="app-navbar-brand">
                <span className="nav-logo">RU</span>
                <span>ResourceHub</span>
            </NavLink>
            
            <nav className="app-navbar-links">
                {isResearcher() && (
                    <>
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/equipment">Equipment</NavLink>
                        <NavLink to="/bookings">My Bookings</NavLink>
                        <div className="nav-dropdown">
                            <button className="nav-dropdown-btn">More</button>
                            <div className="nav-dropdown-menu">
                                <NavLink to="/booking-history">Booking History</NavLink>
                                <NavLink to="/waitlist">Waitlist</NavLink>
                                <NavLink to="/external-bookings">External Bookings</NavLink>
                                <NavLink to="/profile">Profile</NavLink>
                            </div>
                        </div>
                    </>
                )}

                {isLabTechnician() && (
                    <>
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/equipment">Equipment</NavLink>
                        <NavLink to="/maintenance">Maintenance</NavLink>
                        <div className="nav-dropdown">
                            <button className="nav-dropdown-btn">More</button>
                            <div className="nav-dropdown-menu">
                                <NavLink to="/maintenance">Assigned Tasks</NavLink>
                                <NavLink to="/calibration">Calibration</NavLink>
                                <NavLink to="/reports">Maintenance History</NavLink>
                            </div>
                        </div>
                    </>
                )}
                
                {isLabManager() && (
                    <>
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/equipment">Equipment</NavLink>
                        <NavLink to="/bookings">Bookings</NavLink>
                        <NavLink to="/utilization">Utilization</NavLink>
                        <NavLink to="/sharing">Sharing</NavLink>
                        <div className="nav-dropdown">
                            <button className="nav-dropdown-btn">More</button>
                            <div className="nav-dropdown-menu">
                                <NavLink to="/utilization">Heatmap</NavLink>
                                <NavLink to="/utilization">Idle Equipment</NavLink>
                                <NavLink to="/utilization">Demand Analysis</NavLink>
                                <NavLink to="/sharing">Requests</NavLink>
                                <NavLink to="/maintenance">Maintenance</NavLink>
                                <NavLink to="/reports">Reports</NavLink>
                            </div>
                        </div>
                    </>
                )}

                {isDepartmentHead() && (
                    <>
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/equipment">Department Equipment</NavLink>
                        <NavLink to="/utilization">Utilization</NavLink>
                        <NavLink to="/bookings">Bookings</NavLink>
                        <div className="nav-dropdown">
                            <button className="nav-dropdown-btn">More</button>
                            <div className="nav-dropdown-menu">
                                <NavLink to="/utilization">Heatmap</NavLink>
                                <NavLink to="/utilization">Demand Analysis</NavLink>
                                <NavLink to="/sharing">Resource Sharing</NavLink>
                                <NavLink to="/reports">Reports</NavLink>
                            </div>
                        </div>
                    </>
                )}

                {isInstitutionAdmin() && (
                    <>
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/departments">Departments</NavLink>
                        <NavLink to="/equipment">Equipment</NavLink>
                        <NavLink to="/utilization">Utilization</NavLink>
                        <NavLink to="/sharing">Resource Sharing</NavLink>
                        <NavLink to="/users">Users</NavLink>
                        <div className="nav-dropdown">
                            <button className="nav-dropdown-btn">More</button>
                            <div className="nav-dropdown-menu">
                                <NavLink to="/analytics">Analytics</NavLink>
                                <NavLink to="/reports">Cost Analysis</NavLink>
                                <NavLink to="/reports">Equipment Lifecycle</NavLink>
                                <NavLink to="/reports">Reports</NavLink>
                            </div>
                        </div>
                    </>
                )}

                {isSystemAdmin() && (
                    <>
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/users">Users / Roles</NavLink>
                        <NavLink to="/analytics">Analytics</NavLink>
                        <div className="nav-dropdown">
                            <button className="nav-dropdown-btn">More</button>
                            <div className="nav-dropdown-menu">
                                <NavLink to="/users">Access Management</NavLink>
                                <NavLink to="/analytics">System Monitoring</NavLink>
                                <NavLink to="/settings">Configuration</NavLink>
                                <NavLink to="/reports">Logs</NavLink>
                            </div>
                        </div>
                    </>
                )}
            </nav>
            <div className="navbar-account">
                <div className="nav-dropdown" ref={notifRef}>
                    <button
                        className="nav-dropdown-btn notification-btn"
                        title="Notifications"
                        onClick={() => setShowNotifications(prev => !prev)}
                        style={{ position: 'relative' }}
                    >
                        <span>&#128276;</span>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="nav-dropdown-menu notification-menu">
                            <div className="d-flex justify-content-between align-items-center px-3 pb-2"
                                style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <strong style={{ fontSize: '0.85rem' }}>Notifications</strong>
                                {unreadCount > 0 && (
                                    <button
                                        className="btn btn-link btn-sm p-0"
                                        style={{ fontSize: '0.75rem' }}
                                        onClick={markAllAsRead}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div className="notification-item text-muted" style={{ cursor: 'default' }}>
                                    No notifications yet.
                                </div>
                            ) : (
                                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className="notification-item"
                                            style={!n.isRead ? { background: 'var(--surface-alt)' } : {}}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <div className="d-flex justify-content-between">
                                                <strong style={{ fontSize: '0.8rem' }}>
                                                    {!n.isRead && (
                                                        <span style={{ color: 'var(--primary)', marginRight: '4px' }}>•</span>
                                                    )}
                                                    {n.title}
                                                </strong>
                                                <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                    {n.timeAgoText}
                                                </span>
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {n.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="nav-dropdown user-dropdown">
                    <button className="nav-dropdown-btn user-profile-btn">
                        <span className="user-avatar">{name[0].toUpperCase()}</span>
                        <span className="welcome-user">{name}</span>
                    </button>
                    <div className="nav-dropdown-menu user-dropdown-menu">
                        <div className="user-dropdown-header">
                            <div className="user-dropdown-name">{name}</div>
                            <div className="user-dropdown-role">{user?.role ? user.role.replace('ROLE_', '').replace('_', ' ') : 'User'}</div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <NavLink to="/profile">Profile</NavLink>
                        <NavLink to="/settings">Settings</NavLink>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item-danger" onClick={handleLogout}>
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
