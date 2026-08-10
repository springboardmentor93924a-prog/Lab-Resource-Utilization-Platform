import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, ThemeMode, UserProfile, UserSettings } from './types';
import { loginUser, registerUser } from './authThunks';

const savedAuth = typeof window !== 'undefined' ? window.localStorage.getItem('lab-auth-state') : null;
const parsedAuth = savedAuth ? JSON.parse(savedAuth) : null;

const initialState: AuthState = {
  user: parsedAuth?.user ?? null,
  token: parsedAuth?.token ?? null,
  loading: false,
  error: null,
  rememberMe: parsedAuth?.rememberMe ?? true,
  theme: parsedAuth?.theme ?? 'dark',
  notifications: parsedAuth?.notifications ?? [
    { id: 'n1', title: 'System health', message: 'All core services are operating normally.', type: 'success', read: false, archived: false, createdAt: '2026-07-30T09:00:00.000Z' },
    { id: 'n2', title: 'Booking approval', message: 'Two reservations require your review.', type: 'warning', read: false, archived: false, createdAt: '2026-07-30T08:15:00.000Z' },
  ],
  settings: parsedAuth?.settings ?? { theme: 'dark', compactMode: false, notificationsEnabled: true },
  registrationSuccess: false,
  lastRegisteredEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.registrationSuccess = false;
      state.lastRegisteredEmail = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('lab-auth-state');
      }
    },
    setRememberMe(state, action: PayloadAction<boolean>) {
      state.rememberMe = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      state.settings.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      state.settings.theme = state.theme;
    },
    setSettings(state, action: PayloadAction<Partial<UserSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.map((item) => item.id === action.payload ? { ...item, read: true } : item);
    },
    archiveNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.map((item) => item.id === action.payload ? { ...item, archived: true } : item);
    },
    clearRegistrationSuccess(state) {
      state.registrationSuccess = false;
      state.lastRegisteredEmail = null;
    },
    setRegistrationSuccess(state, action: PayloadAction<string | null>) {
      state.registrationSuccess = true;
      state.lastRegisteredEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: UserProfile; token: string }>) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
        state.registrationSuccess = false;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('lab-auth-state', JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
            rememberMe: state.rememberMe,
            theme: state.theme,
            notifications: state.notifications,
            settings: state.settings,
          }));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to sign in.';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: UserProfile; token: string }>) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
        state.registrationSuccess = true;
        state.lastRegisteredEmail = action.payload.user.email;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('lab-auth-state', JSON.stringify({
            user: null,
            token: null,
            rememberMe: state.rememberMe,
            theme: state.theme,
            notifications: state.notifications,
            settings: state.settings,
          }));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to create account.';
      });
  },
});

export const { logout, setRememberMe, setTheme, toggleTheme, setSettings, markNotificationRead, archiveNotification, clearRegistrationSuccess, setRegistrationSuccess } = authSlice.actions;
export default authSlice.reducer;
