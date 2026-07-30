import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, CalendarDays, ChevronRight, HelpCircle, Home, LifeBuoy, ListChecks, LogOut, Package2, Settings, ShieldCheck, UserCircle2, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { logout } from '../features/auth/authSlice';

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Inventory', to: '/inventory', icon: Package2 },
  { label: 'Bookings', to: '/bookings', icon: ListChecks },
  { label: 'Maintenance', to: '/maintenance', icon: ShieldCheck },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Profile', to: '/profile', icon: UserCircle2 },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Help', to: '/help', icon: HelpCircle },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, notifications } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-badge">LR</div>
          <div>
            <h2>Lab Resource</h2>
            <p>Utilization Platform</p>
          </div>
        </div>

        <div className="profile-chip">
          <strong>{user?.name ?? 'Research Lead'}</strong>
          <span>{user?.role ?? 'Lab Manager'}</span>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to} className={`nav-item ${active ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.label}</span>
                <ChevronRight size={16} />
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="mini-card">
            <LifeBuoy size={18} />
            <div>
              <strong>Support</strong>
              <p>24/7 Response</p>
            </div>
          </div>
          <button className="ghost-btn full-width" onClick={handleLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Enterprise operations</p>
            <h1>Lab Resource Utilization Platform</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-btn">Search</button>
            <button className="ghost-btn">{notifications.filter((item: { read: boolean }) => !item.read).length} alerts</button>
            <button className="ghost-btn">Profile</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
