# api/

These modules were relocated here from `src/backend-integration/api/` during
the frontend restructuring pass, to match the requested target architecture
(`api/` sitting at the top level of `src/`, alongside `components/`,
`pages/`, and `routes/`).

**None of these are currently wired into the live app.** The dashboards
under `src/components/<role>/` still read and write only in-memory mock data
from `src/data/mockData.js` — no network calls were added, no API endpoints
were changed, and no backend behavior was introduced. That work is
explicitly out of scope for this restructuring pass.

Only the API modules that already existed (as pre-existing, unwired files
under `backend-integration/`) were moved here: `client.js`, `authApi.js`,
`bookingApi.js`, `equipmentApi.js`, `maintenanceApi.js`,
`notificationApi.js`, `profileApi.js`, `waitlistApi.js`.

The target architecture's suggested file list also mentions `issueReportApi`,
`sharingApi`, `utilizationApi`, `reportApi`, and `userApi` modules. These were
**not created**, since no such API layer exists anywhere in the current
project (those features are mock-data-only today) — adding them would mean
inventing new backend-facing functionality, which this restructuring pass was
explicitly told not to do. They can be added the same way as the others once
real backend integration for those features begins.

See `src/backend-integration/README.md` for the full picture of what's staged
here and what it takes to wire it in.
