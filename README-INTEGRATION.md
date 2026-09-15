# Frontend ↔ Backend Integration Notes

This frontend has been fully rewired to your real Spring Boot backend (no mock data
remains). Read this before you run it.

## Setup

1. `npm install` (pulls in axios, which was added to package.json)
2. Copy `.env.example` to `.env` if you need a different backend URL — it already
   defaults to `http://localhost:8080`.
3. `npm run dev`
4. Make sure your Spring Boot backend is running and CORS is configured to allow
   your frontend's origin (see "Known backend gaps" below).

## What's real vs. what's a workaround

Every page under `src/pages/` now calls the real endpoints in `src/api/`. A few
places had to work around real limitations in the current backend rather than
invented endpoints:

- **My Bookings / Waitlist "mine" views** — there's no `GET /api/bookings/my` or
  per-user waitlist endpoint, so these are filtered client-side from the full list
  by matching `requestedById` to the logged-in user's `userId`.
- **Categories page** — there is no category CRUD endpoint at all. The Categories
  page is read-only, derived from whatever categories already exist on your
  equipment records.
- **Waitlist join** — there's no `POST /api/waitlist`. Users are only added to a
  waitlist automatically by the backend when a booking conflicts.
- **Assigning maintenance technicians** — `LAB_MANAGER` has no endpoint to list
  technicians (`GET /api/users` denies that role), so the Maintenance page asks
  for a technician's numeric user ID directly instead of a dropdown.
- **Demand Analysis / Heatmap** — there's no dedicated analytics endpoint for
  these, so they're derived from combining `/api/equipment`, `/api/bookings`,
  `/api/waitlist`, and `/api/utilization/analytics`.

## CORS

No CORS configuration was found in the backend project. You'll need to add a
`WebMvcConfigurer` (or `@CrossOrigin`) allowing your frontend's dev origin
(typically `http://localhost:5173`) or requests will be blocked by the browser.

## Enum gotcha

`EquipmentStatus` has a genuine typo in the backend enum: `UNAVAILBALE` (not
"UNAVAILABLE"). `src/utils/constants.js` intentionally keeps the misspelling
because the request body must match it exactly.
