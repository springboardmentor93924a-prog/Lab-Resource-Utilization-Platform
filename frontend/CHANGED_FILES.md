# CHANGED_FILES.md — Milestone 3, Task 1 (Frontend): Maintenance & Work Order Management

This documents every frontend file changed for Task 1. Backend work for
this task was delivered separately (see the backend zip's own
`CHANGED_FILES.md`) — this deliverable is frontend-only, nothing under
`backend/` is included or was touched in this pass.

Task 1 requirements covered on the frontend:
- Maintenance scheduling and maintenance requests (view/create/approve/reject)
- Create and manage work orders
- Assign maintenance tasks to Lab Technicians
- Maintenance history, service logs, and equipment downtime (via service log view)

---

## Files changed

### `frontend/src/pages/Maintenance.jsx` (rewritten)
**Why:** the page already had a working "Schedule Maintenance" view
(list + create/edit/mark-complete), but nothing for maintenance
requests, work orders, technician assignment, or service history —
the rest of Task 1.

**What changed:**
- Restructured into **3 tabs**: `Schedule` (existing behavior, kept
  as-is functionally), `Requests` (new), `Work Orders` (new). Default
  tab is `Schedule`, so anyone hitting `/maintenance` sees exactly
  what they saw before, plus two new tabs alongside it.
- **Schedule tab**: added an "Assigned Technician" dropdown to the
  create/edit form (fetched from the new `/api/users/technicians`
  endpoint) and displays the assigned technician on each card. The
  create/edit/mark-complete logic itself is untouched.
- **Requests tab (new)**: lists maintenance requests with a status
  badge. `PENDING` requests get **Approve**/**Reject** buttons
  (`PUT /api/maintenance-requests/{id}`). `APPROVED` requests get a
  **Create Work Order** button
  (`POST /api/work-orders/from-request/{id}`).
- **Work Orders tab (new)**: create a work order directly (equipment
  + description + priority + scheduled date), inline dropdowns to
  assign a technician and change status
  (`PUT /api/work-orders/{id}`), and an expandable **Service Log /
  History** panel per work order
  (`GET`/`POST /api/service-logs/work-order/{id}`) showing every
  logged service entry (date, description, parts, cost, technician)
  and a form to add a new one.
- All three new fetches (`technicians`, `maintenance-requests`,
  `work-orders`) are loaded alongside the existing `maintenance` and
  `equipment` fetches in one `Promise.all`, and are tolerant of a
  403 (a role that can see the Schedule tab but not the others still
  gets a working page — those two lists are just empty).
- No prop/behavior change to anything the app passes into this
  component (`AppRoutes.jsx` already renders `<Maintenance />` with
  no props, so the route stays byte-for-byte the same).

**Functionality:** all four Task 1 requirements, on the frontend.

### `frontend/src/pages/Maintenance.css` (appended only)
**Why:** style the new tab bar and the service-log panel.
**Change:** new rules appended at the end of the file only — nothing
existing was edited, reordered, or removed. Everything the Schedule
tab used before (`.maintenance-card`, `.maintenance-status`,
`.form-group`, etc.) is reused as-is for the new tabs, so no
duplicate/renamed classes were introduced.

---

## Files intentionally NOT changed

- `frontend/src/routes/AppRoutes.jsx` — the `/maintenance` route
  already allowed the right roles
  (`LAB_TECHNICIAN, LAB_MANAGER, DEPARTMENT_HEAD, INSTITUTION_ADMIN, SYSTEM_ADMIN`)
  and already renders `<Maintenance />` with no props. Since the new
  tabs live inside the existing page rather than as new routes, no
  routing change was needed.
- `frontend/src/components/Sidebar.jsx` — the existing "Maintenance"
  nav link already points at `/maintenance`; no new link needed.
- Everything else under `frontend/src/` — untouched.

---

## API contract this page now depends on

All of these are new endpoints added on the backend side of Task 1
(see the backend deliverable). No existing endpoint's request/response
shape changed.

```
GET    /api/users/technicians
GET    /api/maintenance-requests
PUT    /api/maintenance-requests/{id}

GET    /api/work-orders
POST   /api/work-orders
POST   /api/work-orders/from-request/{requestId}
PUT    /api/work-orders/{id}

GET    /api/service-logs/work-order/{workOrderId}
POST   /api/service-logs/work-order/{workOrderId}
```

Pre-existing endpoints this page already used
(`GET/POST/PUT /api/maintenance`, `GET /api/equipment`) are called
exactly as before.

---

## Verification performed in this environment

This sandbox has no network access, and `node_modules` for this
project isn't present here (not shipped in the zip, and `npm
install` needs network), so a real `vite build` / ESLint run could
not be executed in this pass. What *was* verified:
- `Maintenance.jsx` parsed cleanly with the TypeScript compiler's
  JSX parser in syntax-only mode (`ts.createSourceFile` with
  `ScriptKind.JSX`) — zero syntax errors across all ~1,100 lines.
- Every `fetch()` URL in the file was extracted and cross-checked
  character-for-character against the actual backend controller
  mappings (`/api/users/technicians`, `/api/maintenance-requests/{id}`,
  `/api/work-orders`, `/api/work-orders/{id}`,
  `/api/work-orders/from-request/{id}`,
  `/api/service-logs/work-order/{id}`) — all match.
- Brace balance checked on both the `.jsx` and `.css` files.
- Confirmed `AppRoutes.jsx`, `Sidebar.jsx`, and `ProtectedRoute.jsx`
  need no changes for this page restructure (verified role strings
  stored in `sessionStorage` — e.g. `"LAB_TECHNICIAN"` — match what
  both the frontend route guards and the backend's `@PreAuthorize`
  expect, so no casing/naming mismatches).

**Please still run before relying on this build:**
```bash
cd frontend
npm install
npm run dev
```
Then log in as a Lab Manager/Technician and walk: Requests → Approve
→ Create Work Order → assign a technician → add a service log entry
→ mark Completed.
