# Reports & Analytics Module — Implementation Walkthrough

> **Build Status:** ✅ `BUILD SUCCESS` — 174 source files compiled successfully.

---

## What Was Implemented

### 1. New Reports API Controller

**`ReportsController.java`** maps the reports module endpoints. It preserves all active functionality (migrated from `ReportController.java` which was deleted) and adds 7 new dynamic report handlers under `/api/reports`:

- `POST /api/reports/generate` (preserved) — uploads reports to cloud storage
- `GET /api/reports` (preserved) — lists generated reports
- `GET /api/reports/utilization` — equipment utilization report
- `GET /api/reports/maintenance` — maintenance and downtime report
- `GET /api/reports/bookings` — booking and usage report
- `GET /api/reports/department-performance` — department head dashboard stats report
- `GET /api/reports/compliance` — compliance check reports (calibration & certification)
- `GET /api/reports/sharing-cost` — inter-institution equipment sharing report
- `GET /api/reports/issues` — "Fix Issues" summary dashboard

---

### 2. High-Performance Report Service

**`ReportService.java`** contains the implementations for compiling report metrics dynamically:

- **Security & Authorization**: Enforces context role limitations. 
  - `LAB_MANAGER` and `DEPARTMENT_HEAD` are strictly constrained to their user principal's department ID (`principal.getDepartmentId()`). Any custom `departmentId` parameter is ignored.
  - `INSTITUTION_ADMIN` is restricted to their `institutionId` scope.
- **Batch Processing**: Fetches all entities, logs, calibrations, and metrics in batch queries (`findByEquipmentIdIn`, etc.) and groups them in-memory to prevent N+1 queries.
- **Date Range Validation**: Ensures that `from` is not after `to` date.
- **Live Utilization Blend**: When reports cover the current day (today), `ReportService` queries historical `UtilizationMetric` entries from the start date through yesterday, and blends them with real-time `UtilizationLog` records for today, ensuring today's hours are never double-counted.

---

### 3. Report DTOs

Created 8 new data transfer objects to transfer structured report statistics cleanly:

- `EquipmentUtilizationReportDTO`
- `MaintenanceDowntimeReportDTO`
- `BookingUsageReportDTO`
- `DepartmentPerformanceReportDTO` — separates current snaphot counts (live today) from date-range based metrics
- `ComplianceReportDTO` — groups calibrations and certifications with compliance category summary counts
- `SharingCostReportDTO`
- `IssueSummaryReportDTO` — returns actionable references (`latestIssueReportId`, `activeMaintenanceRequestId`, and `assignedTechnicianId`) to enable frontend navigation to work orders
- `IssueSummaryResponseDTO`

---

### 4. Repository Additions (Property-Aligned Query Methods)

| Repository | Query Methods Added |
|------------|---------------------|
| `BookingRepository` | `findByEquipmentIdInAndStartTimeBetween`, `findByEquipmentIdIn` |
| `MaintenanceRequestRepository` | `findByEquipmentIdInAndCreatedAtBetween`, `findByEquipmentIdIn`, `countByEquipmentIdGrouped` |
| `EquipmentIssueReportRepository` | `findByEquipmentIdInAndCreatedAtBetween`, `findByEquipmentIdIn` |
| `UtilizationMetricRepository` | `findByEquipmentIdInAndPeriodDateBetween` |
| `UtilizationLogRepository` | `findByBookingIdIn`, `findByEquipmentIdInAndUsageStartTimeAfter` |
| `SharedBookingRepository` | `findByAgreementIdIn` |
| `SharingAgreementRepository` | `findByEquipmentIdIn` |
| `InvoiceRepository` | `findBySharingAgreementIdIn` |
| `EquipmentCalibrationRepository` | `findByEquipmentIdIn` |
| `EquipmentCertificationRepository` | `findByEquipmentIdIn` |
