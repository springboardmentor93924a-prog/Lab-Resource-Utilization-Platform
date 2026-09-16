# Backend integration (staged, not yet wired in)

Everything in this folder is a **complete, self-contained, real-API-driven**
version of the researcher-facing app — it talks to a Spring Boot backend at
`http://localhost:8080/api` (see `src/api/client.js`), handles JWT sessions,
and has its own `AuthProvider`/`useAuth()`.

It is **not currently imported by `main.jsx` / `src/App.jsx`**. The app that
actually runs today is the mock-data demo under `src/pages/`,
`src/routes/`, and `src/components/` (dashboards driven by
`src/data/mockData.js`, no network calls).

**Update from the frontend restructuring pass:** this folder's `api/` and
`context/` subfolders were relocated to top-level `src/api/` and
`src/context/` to match the target ROLE → FEATURE → COMPONENT architecture
(which calls for `api/` and `context/` to sit directly under `src/`,
alongside `components/`, `pages/`, and `routes/`). No other backend
functionality was added or changed — these are still the exact same
pre-existing, unwired files, just relocated one level up. Every import in
this folder's `components/` was updated to point at the new location
(`../../../api/...` and `../../../context/...`), so this reference build
still behaves exactly as before. See `src/api/README.md` for details.

This folder's `components/` were otherwise kept exactly as they already
existed (just moved as a whole into this folder previously, no other
changes) so nothing here breaks. When real backend integration begins:

1. Wrap the app in `<AuthProvider>` (`src/context/AuthContext.jsx`).
2. Decide how `components/researcher/ResearcherApp.jsx` (the real,
   API-driven researcher flow) replaces or coexists with
   `src/components/researcher/dashboard/ResearcherDashboard.jsx` (the
   current mock-data researcher dashboard).
3. Point `src/api/client.js`'s `VITE_API_BASE_URL` at the real backend.
4. Do the same for technician / manager / department-head / institution-admin
   once those API-driven flows exist (currently only the researcher flow and
   auth screens have been built this way).

## Contents

- `../api/` (top-level `src/api/`) — `client.js` (fetch wrapper, JWT/session
  handling) + one module per resource (`authApi`, `bookingApi`,
  `equipmentApi`, `maintenanceApi`, `notificationApi`, `profileApi`,
  `waitlistApi`). Moved out of this folder — see note above.
- `../context/AuthContext.jsx` (top-level `src/context/`) — `AuthProvider` +
  `useAuth()`. Moved out of this folder — see note above.
- `components/common/` — `Logo`, `Modal`, `Field`, `SectionLabel`,
  `ToastStack`, `useToasts`, `roles` (a *different* role/flow config than
  the live app's `RoleSelectPage.jsx` — do not merge the two).
- `components/auth/` — `LoginPage`, `RegisterPage`,
  `InstitutionAdminRegisterPage`, `PendingPage`, `RoleSelectPage` (real-API
  versions).
- `components/landing/LandingPage.jsx` — same landing page design as
  `src/pages/LandingPage.jsx`, kept here since it was already part of this
  set.
- `components/researcher/` — `ResearcherApp.jsx` (entry point),
  `ResearcherLayout.jsx`, `ResearcherDashboard.jsx`, `SearchEquipment.jsx`,
  `EquipmentDetails.jsx`, `BookEquipmentForm.jsx`, `WaitlistModal.jsx`,
  `MyBookings.jsx`, `ReportIssue.jsx`, `NotificationsCenter.jsx`,
  `ProfilePage.jsx`, `ResearcherRegisterPage.jsx`.
