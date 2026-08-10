export type UserRole = 'Researcher' | 'Student' | 'Lab Technician' | 'Lab Manager' | 'Department Head' | 'Institution Admin' | 'System Admin';
export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  institution: string;
  department: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  title?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface UserSettings {
  theme: ThemeMode;
  compactMode: boolean;
  notificationsEnabled: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
  theme: ThemeMode;
  notifications: NotificationItem[];
  settings: UserSettings;
  registrationSuccess: boolean;
  lastRegisteredEmail: string | null;
}
