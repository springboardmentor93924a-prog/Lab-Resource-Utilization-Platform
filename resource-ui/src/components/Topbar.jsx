import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Topbar() {
    const nav = useNavigate();
    const name = localStorage.getItem("name") || "User";
    const role = localStorage.getItem("role") || "Administrator";
    const [devMode, setDevMode] = useState(() => localStorage.getItem("devMode") === "true");
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDevModeToggle = (e) => {
        const isEnabled = e.target.checked;
        setDevMode(isEnabled);
        localStorage.setItem("devMode", isEnabled);
        window.dispatchEvent(new Event("storage"));
        window.location.reload();
    };

    const logout = () => {
        localStorage.clear();
        nav('/login');
    };

    return (
        <header className="app-topbar animate-fade-in">
            <div className="topbar-account">
                
                <div className="dev-mode-toggle" title="Enable Mock Data">
                    <label>DEV MODE</label>
                    <label className="switch">
                        <input type="checkbox" checked={devMode} onChange={handleDevModeToggle} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="user-profile-dropdown" ref={dropdownRef}>
                    <div className="user-profile-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                        <span className="user-avatar">{name[0].toUpperCase()}</span>
                        <div className="user-details">
                            <span className="welcome-user">{name}</span>
                            <span className="user-role">{role.replace('ROLE_', '').replace('_', ' ')}</span>
                        </div>
                        <svg className={`dropdown-chevron ${menuOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>

                    {menuOpen && (
                        <div className="profile-menu">
                            <div className="profile-menu-header">
                                <span className="menu-name">{name}</span>
                                <span className="menu-role">{role.replace('ROLE_', '').replace('_', ' ')}</span>
                            </div>
                            <div className="profile-menu-divider"></div>
                            <button className="profile-menu-item" onClick={() => { setMenuOpen(false); nav('/profile'); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                My Profile
                            </button>
                            <button className="profile-menu-item" onClick={() => { setMenuOpen(false); nav('/settings'); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                Settings
                            </button>
                            <div className="profile-menu-divider"></div>
                            <button className="profile-menu-item text-danger" onClick={logout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
                
            </div>
        </header>
    );
}

export default Topbar;
