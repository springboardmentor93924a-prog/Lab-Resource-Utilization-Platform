# CHANGED_FILES.md — Milestone 3, Task 1: Maintenance & Work Order Management

This file documents every backend file created or modified to implement
Task 1. Nothing outside the backend was touched. No existing endpoint's
request/response contract was changed — only additive changes and one
schema/permission fix that were required for Task 1 to actually work.

Task 1 requirements covered:
- Maintenance scheduling and maintenance requests
- Create and manage work orders
- Assign maintenance tasks to Lab Technicians
- Maintenance history, service logs, and equipment downtime

---

## 0. Pre-existing bug fixed (blocking)

### DELETED: `service/MaintenanceRequestServiceImpl.java`
Two classes implemented `MaintenanceRequestService` and were both
annotated `@Service`:
- `service/MaintenanceRequestServiceImpl.java` (duplicate, deleted)
- `service/impl/MaintenanceRequestServiceImpl.java` (kept — matches the
  package convention used by every other service in the project)

With both present, Spring fails at startup with
`NoUniqueBeanDefinitionException` and the application **will not boot**.
This had nothing to do with Task 1 directly, but Task 1 cannot be
implemented or tested against an application that doesn't start.

---

## 1. New files (Work Orders)

| File | Layer | What it does |
|---|---|---|
| `repository/WorkOrderRepository.java` | Repository | Lookups by technician, equipment, status, source request |
| `service/WorkOrderService.java` | Service (interface) | Contract for work order lifecycle |
| `service/impl/WorkOrderServiceImpl.java` | Service (impl) | Create/update/assign work orders; keeps equipment status ("Available" ⇄ "Under Maintenance") and downtime windows in sync automatically; notifies the assigned technician; releases the equipment's booking waitlist once a work order closes |
| `controller/WorkOrderController.java` | Controller | `/api/work-orders/**` REST endpoints |

## 2. New files (Service Logs / Maintenance History)

| File | Layer | What it does |
|---|---|---|
| `repository/MaintenanceServiceLogRepository.java` | Repository | Logs per work order, and a joined query for full equipment history |
| `service/MaintenanceServiceLogService.java` | Service (interface) | Contract for logging/reading service history |
| `service/impl/MaintenanceServiceLogServiceImpl.java` | Service (impl) | Adds a log entry (technician + date default to the logged-in user / today); reads logs per work order or per equipment |
| `controller/MaintenanceServiceLogController.java` | Controller | `/api/service-logs/**` REST endpoints |

## 3. New files (Equipment Downtime)

| File | Layer | What it does |
|---|---|---|
| `repository/EquipmentDowntimeRepository.java` | Repository | Downtime history per equipment; "currently open" window lookup |
| `service/EquipmentDowntimeService.java` | Service (interface) | Contract for opening/closing/logging downtime |
| `service/impl/EquipmentDowntimeServiceImpl.java` | Service (impl) | Opens a downtime window when equipment goes into maintenance, closes it when work finishes; also supports manual logging for downtime not tied to a work order |
| `controller/EquipmentDowntimeController.java` | Controller | `/api/equipment-downtime/**` REST endpoints |

---

## 4. Modified files

### `entity/WorkOrder.java`
**Why:** the `maintenanceRequest` association was mapped
`@JoinColumn(name = "request_id", nullable = false)`. That forces
every work order to originate from a `MaintenanceRequest`, which
directly contradicts Task 1's "Create and manage work orders"
requirement — the API also needs to support raising a work order
directly (equipment + description), with no request behind it.
**Change:** `nullable = false` → `nullable = true` on that one
`@JoinColumn`. Nothing else in the entity changed.
**Functionality:** Create and manage work orders.

### `config/SecurityConfig.java`
**Why (two separate reasons):**
1. `/api/users/**` was locked to `INSTITUTION_ADMIN` / `SYSTEM_ADMIN`
   at the HTTP filter-chain level. Spring evaluates
   `authorizeHttpRequests` matchers in order (first match wins) — that
   runs *before* any `@PreAuthorize` on the controller. The new
   `/api/users/technicians` endpoint (needed so Lab Managers/
   Technicians can list technicians to assign work to) would have
   been blocked with 403 for every role except admins, regardless of
   its own `@PreAuthorize`.
2. The new `/api/work-orders/**`, `/api/service-logs/**`,
   `/api/equipment-downtime/**`, and `/api/maintenance-requests/**`
   paths had no explicit matcher. They still resolved correctly via
   the pre-existing `.anyRequest().authenticated()` fallback, so this
   part is a documentation/clarity addition, not a behavior change —
   made explicit to match the existing style used for
   `/api/equipment/**` and `/api/bookings/**`.
**Change:** Added a `.requestMatchers("/api/users/technicians")` rule
*before* the existing `/api/users/**` rule (allows
`LAB_TECHNICIAN`, `LAB_MANAGER`, `DEPARTMENT_HEAD`,
`INSTITUTION_ADMIN`, `SYSTEM_ADMIN`), and added an explicit
`.authenticated()` matcher block for the five Task 1 base paths.
Nothing was removed; no existing rule's role list changed.
**Functionality:** Assign maintenance tasks to Lab Technicians
(unblocks the technician-lookup endpoint); Work orders / service
logs / downtime reachability.

### `repository/UserRepository.java`
**Why:** needed a way to fetch Lab Technicians, scoped to an
institution, for the "assign technician" flow.
**Change:** appended two derived query methods after the existing
`findByInstitution_InstitutionId`:
```java
List<User> findByInstitution_InstitutionIdAndRole_RoleName(Integer institutionId, String roleName);
List<User> findByRole_RoleName(String roleName);
```
**Functionality:** Assign maintenance tasks to Lab Technicians.

### `service/UserService.java`
**Why:** same as above — expose a technician list through the
service layer, institution-scoped (System Admin sees every
institution's technicians).
**Change:** appended a new `getTechnicians()` method after the
existing `getUserById(Integer id)`. No existing method changed.
**Functionality:** Assign maintenance tasks to Lab Technicians.

### `controller/UserController.java`
**Why:** expose `getTechnicians()` as `GET /api/users/technicians`,
reachable by technicians/managers, not just admins — the class itself
is `@PreAuthorize`-locked to admins, so this needed its own
method-level override (which takes precedence over the class-level
annotation for that one method).
**Change:** appended a new endpoint after the existing
`getAllUsers()`. No existing endpoint changed.
```java
@PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
@GetMapping("/technicians")
public ResponseEntity<List<User>> getTechnicians() { ... }
```
**Functionality:** Assign maintenance tasks to Lab Technicians.

### `controller/MaintenanceRequestController.java`
**Why:** the controller already had `GET` (list) and `POST`
(create), but no way to fetch a single request or to approve/reject
one — both required for "maintenance requests" to be a usable
workflow, and for approved requests to be convertible into work
orders.
**Change:** added `GET /api/maintenance-requests/{id}` and
`PUT /api/maintenance-requests/{id}` (technician/manager/admin only —
reviews a request, e.g. sets `requestStatus` to `APPROVED` /
`REJECTED`). The existing `GET` (list) and `POST` (create) endpoints
are untouched — same behavior, same response shape.
**Functionality:** Maintenance requests.

---

## 4.1 Post-delivery compile fix

### `service/impl/WorkOrderServiceImpl.java` — `createWorkOrder()`
**Why:** reported by the user after running `gradle bootRun` locally —
`javac` correctly rejected the original code:
```
error: local variables referenced from a lambda expression must be final or effectively final
```
The `equipment` local variable was reassigned
(`equipment = equipmentRepository.findById(...)`) and then referenced
inside the `orElseThrow(() -> ...)` lambda on the same statement. Java
lambdas can only capture variables that are never reassigned after
their first assignment ("effectively final") — `equipment` no longer
qualified once it was being reassigned on that very line.
**Fix:** captured `equipment.getEquipmentId()` into its own
`final Integer equipmentId` *before* the reassignment, and referenced
that instead inside the lambda. No behavior change — same lookup,
same error message, same exception type.
**Functionality:** Create and manage work orders (this was in the
`createWorkOrder` method that raises a work order directly, not from
a request).

## 4.2 Post-delivery fix: technician dropdown returning empty

**Symptom reported:** on the Schedule Maintenance form, every field
worked except "Assigned Technician" — the dropdown had no options.

**Root cause:** `UserService.getTechnicians()` and the two repository
methods it called (`findByRole_RoleName`,
`findByInstitution_InstitutionIdAndRole_RoleName`) did an **exact
string match** against the `role_name` column, filtering for the
literal value `"LAB_TECHNICIAN"`. This project has no seed data for
the `roles` table, so those rows were entered by hand into Postgres
and may not be byte-identical to that literal (e.g. `"Lab
Technician"`, extra spaces, different casing).

Meanwhile `JwtAuthenticationFilter` (pre-existing, untouched) already
normalizes the role name for login/authorization:
```java
new SimpleGrantedAuthority("ROLE_" + role.toUpperCase().replace(" ", "_"));
```
So a technician could log in and pass every `@PreAuthorize` check
fine, while the exact-match DB query used to *list* technicians
silently returned zero rows for the same user — not a missing table,
a string-matching mismatch between two different pieces of code that
should have agreed on how to compare role names but didn't.

**Fix — `service/UserService.java`:** `getTechnicians()` now fetches
the candidate user list (institution-scoped, or all users for
`SYSTEM_ADMIN`) and filters it in memory using the exact same
normalization as `JwtAuthenticationFilter`
(`roleName.trim().toUpperCase().replace(" ", "_")`), so it matches
however the role is actually stored, not just one exact spelling.

**Fix — `repository/UserRepository.java`:** removed the two now-dead
exact-match derived query methods
(`findByRole_RoleName`, `findByInstitution_InstitutionIdAndRole_RoleName`)
since nothing calls them anymore and leaving a broken query path in
the repository would be misleading for future changes. The
pre-existing `findByInstitution_InstitutionId` (already used
elsewhere in this file before Task 1) is reused instead.

**No database change needed** — this was purely an application-layer
string-comparison bug, not a schema or missing-table issue. If the
dropdown is still empty after pulling this fix, the remaining
possibility is that no user in your `users` table actually has a
role whose name normalizes to `LAB_TECHNICIAN` (e.g. check
`SELECT role_name FROM roles;` and confirm at least one user is
linked to that role and to the same institution as the account
you're testing with).

## 5. Database / schema notes

The project runs with `spring.jpa.hibernate.ddl-auto=update`
(see `backend/src/main/resources/application.properties`), so on the
next application start Hibernate will:
- create four new tables from the pre-existing entities that had no
  repository/service/controller before this change:
  `work_orders`, `maintenance_service_logs`, `equipment_downtime`
  (table names come from each entity's existing `@Table` annotation —
  these entities were already in the project, just unused)
- attempt to relax the `work_orders.request_id` column to nullable

**If your Postgres instance does not pick up the nullable change
automatically** (Hibernate's `update` mode does not always alter
existing NOT NULL constraints on some Postgres/Hibernate version
combinations), run this once by hand:
```sql
ALTER TABLE work_orders ALTER COLUMN request_id DROP NOT NULL;
```
No other manual migration should be necessary. No existing table or
column was removed or renamed.

---

## 6. New API surface (all new, nothing existing changed)

```
GET    /api/work-orders
GET    /api/work-orders/my-work-orders
GET    /api/work-orders/{id}
GET    /api/work-orders/equipment/{equipmentId}
POST   /api/work-orders
POST   /api/work-orders/from-request/{requestId}
PUT    /api/work-orders/{id}
PUT    /api/work-orders/{id}/assign

GET    /api/service-logs/work-order/{workOrderId}
GET    /api/service-logs/equipment/{equipmentId}
POST   /api/service-logs/work-order/{workOrderId}

GET    /api/equipment-downtime
GET    /api/equipment-downtime/equipment/{equipmentId}
POST   /api/equipment-downtime
PUT    /api/equipment-downtime/{id}/resolve

GET    /api/maintenance-requests/{id}      (new)
PUT    /api/maintenance-requests/{id}      (new)
GET    /api/users/technicians              (new)
```

Pre-existing endpoints (`/api/maintenance/**`,
`/api/maintenance-requests` GET list and POST create, `/api/users`
GET list, etc.) are unchanged in behavior and response shape.

---

## 7. Verification performed in this environment

This sandbox has no network access and no cached Gradle/Maven
dependencies, so a full `./gradlew build` could not be executed here.
What *was* verified:
- Every new/edited `.java` file: balanced braces, correct package
  declaration.
- Every entity field and getter/setter referenced from new code
  (`WorkOrder`, `MaintenanceServiceLog`, `EquipmentDowntime`,
  `MaintenanceRequest`, `Equipment`, `User`) was cross-checked
  character-for-character against the actual entity source.
- Method signatures of every existing service called from new code
  (`NotificationService.create(...)`,
  `BookingService.processWaitlistForEquipment(...)`) were confirmed
  against their real interfaces.
- The `SecurityConfig` filter-chain-vs-method-security interaction
  was traced by hand (see the `SecurityConfig.java` entry above) —
  this caught a real bug before packaging.
- `application.properties` was re-checked for `ddl-auto=update` to
  confirm new tables will be created automatically.

**Please still run before relying on this build:**
```bash
cd backend
./gradlew clean build
./gradlew bootRun
```
Watch the startup log for any bean or schema errors, then exercise
the new endpoints (see the walkthrough at the bottom of the chat
response) with a real JWT.

---

## 8. Post-delivery bug fix: `GET /api/maintenance-requests` throwing
`EntityNotFoundException` for `Equipment`

**Symptom:** `POST /api/maintenance-requests` returned 200 and the
row was saved correctly, but `GET /api/maintenance-requests`
returned HTTP 400/500 with:
```
No row with the given identifier exists for entity
[com.example.lab_platform.entity.Equipment with id '7']
```
— even though `equipment_id = 7` genuinely exists in the `equipment`
table.

**Root cause — `entity/Equipment.java`:** the `institution` field
was mapped:
```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "institution_id", nullable = false)
private Institution institution;
```
Hibernate uses `@JoinColumn(nullable = ...)` (not `@ManyToOne`'s
`optional` flag) to pick **INNER JOIN vs LEFT OUTER JOIN** for an
EAGER association's own load query. With `nullable = false`,
Hibernate generated an INNER JOIN against `institutions`. The actual
Postgres column (`public.equipment.institution_id`) has **no
NOT NULL constraint**, and most existing equipment rows (legacy data
predating multi-institution support) genuinely have
`institution_id = NULL`. For those rows, the INNER JOIN returned
zero rows on load, so Hibernate treated the row as not found —
purely a metadata/data mismatch, not a missing row.

This only surfaced on `GET` because listing requests fully
initializes each request's `Equipment` (to read `equipmentName` in
`MaintenanceRequestDTO`). `POST` never hit it, because creating a
request only attaches a detached `Equipment` reference (just the ID)
to the new row — it doesn't need to re-load Equipment's own eager
join.

**Fix:** changed `nullable = false` → `nullable = true` on that one
`@JoinColumn`. Fetch type (`EAGER`) is unchanged, so no other code
that reads `equipment.getInstitution()` synchronously
(`BookingServiceImpl`, `ResourceSharingServiceImpl`,
`UtilizationServiceImpl` — all already null-check it) is affected.
`User.institution` was checked and left untouched: every `users` row
has a non-null `institution_id`, so it was never exposed to this bug.

**No database change needed** — the column was already nullable at
the Postgres level; this was purely an entity-mapping bug.

**Functionality:** `GET /api/maintenance-requests` (and any other
endpoint that fully loads `Equipment` rows with a null
`institution_id`, e.g. `/api/work-orders`, `/api/service-logs/**`,
`/api/equipment-downtime/**`).

---

## 9. New: full `Maintenance` module (`/api/maintenance/**`)

**Why:** the database has a pre-existing `maintenance` table (6 real
rows: scheduled/preventive maintenance history — type, date, status,
next-due date, assigned technician) with **no Java layer at all** —
no entity, repository, service, or controller anywhere in the
project. It is distinct from `maintenance_requests`
(`MaintenanceRequest` — the student/technician/manager request
lifecycle) and `maintenance_service_logs` (`MaintenanceServiceLog` —
a technician's service entries against a `WorkOrder`), which already
existed and already worked.

**New files added:**

| File | Layer | What it does |
|---|---|---|
| `entity/Maintenance.java` | Entity | Maps to the pre-existing `maintenance` table |
| `repository/MaintenanceRepository.java` | Repository | By equipment, by status, by technician, "due/overdue" lookup |
| `dto/MaintenanceDTO.java` | DTO | Flattened read shape, no lazy proxies |
| `service/MaintenanceService.java` + `impl/MaintenanceServiceImpl.java` | Service | Schedule/update maintenance, resolve equipment + technician from ID, defaults `maintenanceDate`/`maintenanceStatus` |
| `controller/MaintenanceController.java` | Controller | `/api/maintenance/**` REST endpoints |

**Design notes (matches real DB, no assumptions):**
- Every DB column on `maintenance` except `maintenance_id` is
  nullable (checked against the actual `CREATE TABLE` in the backup),
  and real rows have `assigned_technician_id = NULL`. Nothing is
  mapped `nullable = false`.
- Both associations (`equipment`, `assignedTechnician`) are
  `FetchType.LAZY` — deliberately avoiding the exact
  EAGER + `nullable = false` inner-join bug fixed in section 8
  (`Equipment.institution`).
- Role checks copy the existing `MaintenanceServiceLogController` /
  `EquipmentDowntimeController` convention exactly: read access for
  `LAB_TECHNICIAN, LAB_MANAGER, DEPARTMENT_HEAD, INSTITUTION_ADMIN,
  SYSTEM_ADMIN`; write access (`POST`/`PUT`) narrowed to
  `LAB_TECHNICIAN, LAB_MANAGER, INSTITUTION_ADMIN, SYSTEM_ADMIN`.

**Endpoints added:**
```
GET  /api/maintenance                    - all records
GET  /api/maintenance/{id}                - one record
GET  /api/maintenance/equipment/{id}       - history for one equipment
GET  /api/maintenance/upcoming             - due/overdue, not completed
POST /api/maintenance                      - schedule a new record
PUT  /api/maintenance/{id}                 - update status/date/technician
```

**No conflict with existing modules:** nothing in
`MaintenanceRequest`, `WorkOrder`, or `MaintenanceServiceLog` was
touched by this addition.

---

## 10. Fix: `equipment_downtime.maintenance_id` was a real, unmapped
column (bonus finding while building the module above)

**Found:** the actual `equipment_downtime` table has:
```sql
equipment_id integer NOT NULL,
maintenance_id integer   -- real column, real FK -> maintenance(maintenance_id)
```
...but `entity/EquipmentDowntime.java` never mapped `maintenance_id`
at all, and instead mapped a `work_order_id` column that **does not
exist in this table** in the current database snapshot (it only
exists once the `work_orders` table itself was created per section
3/5 above — the FK column on `equipment_downtime` pointing back to
it was never added).

**Change:** added a new, additive `maintenance` field (`LAZY`,
nullable) to `EquipmentDowntime.java`, mapped to the existing
`maintenance_id` column/FK, with a getter/setter. The existing
`workOrder` field was **not removed or altered** — `WorkOrderServiceImpl`
depends on it directly (`openDowntimeWindow(equipment, workOrder,
reason)` / `closeOpenDowntimeWindow(equipment)`), so removing it
would break the work-order lifecycle. `EquipmentDowntimeDTO.java` was
extended with `maintenanceId` the same way `workOrderId` was already
exposed.

**Database — correction, verified against the live DB after this
section was first written:** the SQL originally suggested here
(`ADD COLUMN work_order_id ...` + `ADD CONSTRAINT ...`) assumed the
column was still missing, based on the dump analyzed at the time.
Querying the live database (`information_schema.columns` +
`pg_constraint`) afterward showed `ddl-auto=update` had *already*
added both `work_order_id` and its FK
(`fk7wlxgcu2wlretcqyr73dghswe`) automatically on an earlier app
restart — same as it does for a normal new column. Running the
`ADD COLUMN` statement correctly failed
(`column "work_order_id" of relation "equipment_downtime" already
exists`, SQLSTATE 42701); the `ADD CONSTRAINT` statement ran anyway
and created a second, redundant FK
(`fk_equipment_downtime_work_order`) on the same column pair.

**No SQL is required for either association.** Both
`maintenance_id → maintenance(maintenance_id)`
(`fk1fx57cneoe7onkk8fp8nk65fc`, pre-existing) and
`work_order_id → work_orders(work_order_id)`
(`fk7wlxgcu2wlretcqyr73dghswe`, Hibernate-managed) are already
correctly in place. The one cleanup needed is dropping the duplicate
constraint this section's SQL created:
```sql
ALTER TABLE equipment_downtime
    DROP CONSTRAINT fk_equipment_downtime_work_order;
```

**Functionality:** `GET/POST /api/equipment-downtime/**` (now able to
report/accept a `maintenanceId` in addition to `workOrderId`); no
change to `WorkOrderServiceImpl`'s automatic downtime open/close
behavior.
