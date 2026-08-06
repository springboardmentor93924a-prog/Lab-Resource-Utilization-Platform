const fs = require('fs');
const css = \
/* --- Professional User Profile Dropdown --- */
.user-profile-dropdown {
    position: relative;
    font-family: 'Inter', sans-serif;
}

.user-profile-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 6px 12px 6px 6px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
}

.user-profile-trigger:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
}

.user-details {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.welcome-user {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
}

.user-role {
    color: var(--text-muted);
    font-size: 11px;
    text-transform: capitalize;
    font-weight: 500;
}

.dropdown-chevron {
    color: var(--text-muted);
    transition: transform 0.2s ease;
    margin-left: 4px;
}

.dropdown-chevron.open {
    transform: rotate(180deg);
}

.profile-menu {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 220px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    padding: 8px 0;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.7);
    animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    z-index: 100;
}

.profile-menu-header {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
}

.profile-menu-header .menu-name {
    color: #fff;
    font-weight: 600;
    font-size: 14px;
}

.profile-menu-header .menu-role {
    color: var(--text-muted);
    font-size: 12px;
    margin-top: 2px;
    text-transform: capitalize;
}

.profile-menu-divider {
    height: 1px;
    background: var(--border-glass);
    margin: 4px 0;
}

.profile-menu-item {
    width: 100%;
    text-align: left;
    padding: 10px 16px;
    background: transparent;
    border: none;
    color: var(--text-main);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.profile-menu-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
}

.profile-menu-item svg {
    color: var(--text-muted);
    transition: color 0.2s;
}

.profile-menu-item:hover svg {
    color: inherit;
}

.profile-menu-item.text-danger {
    color: #ef4444;
}

.profile-menu-item.text-danger:hover {
    background: rgba(239, 68, 68, 0.1);
}

.profile-menu-item.text-danger svg {
    color: #ef4444;
}
\;
fs.appendFileSync('index.css', css);
