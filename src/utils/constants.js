// These mirror the backend enums EXACTLY (case-sensitive strings sent over JSON).
// Keep in sync with the Java enums if the backend changes.

// user/entites/Role.java
export const ROLES = [
  "RESEARCHER",
  "LAB_TECHNICIAN",
  "LAB_MANAGER",
  "DEPARTMENT_HEAD",
  "INSTITUTION_ADMIN",
  "SYSTEM_ADMIN",
];

export const ROLE_LABELS = {
  RESEARCHER: "Researcher",
  LAB_TECHNICIAN: "Lab Technician",
  LAB_MANAGER: "Lab Manager",
  DEPARTMENT_HEAD: "Department Head",
  INSTITUTION_ADMIN: "Institution Admin",
  SYSTEM_ADMIN: "System Admin",
};

// Equipment/entity/EquipmentStatus.java
// NOTE: "UNAVAILBALE" is a typo in the backend enum itself - it must be sent
// exactly like that (misspelled) or the request will fail deserialization.
export const EQUIPMENT_STATUSES = [
  "AVAILABLE",
  "BOOKED",
  "IN_USE",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
  "UNAVAILBALE",
  "RETIRED",
];

// booking/entity/BookingStatus.java
export const BOOKING_STATUSES = [
  "PENDING_APPROVAL",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

// EquipmentUtilization/Entity/UtilizationStatus.java
export const UTILIZATION_STATUSES = ["ACTIVE", "COMPLETED"];

// ResourceSharing/Entity/SharingRequestStatus.java
export const SHARING_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

// maintainance/Entities/RequestStatus.java
export const MAINTENANCE_REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SCHEDULED",
];

// maintainance/Entities/orderStatus.java
export const WORK_ORDER_STATUSES = [
  "CREATED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

// Equipment/entity/CertificationStatus.java
export const CERTIFICATION_STATUSES = ["NOT_CERTIFIED", "ACTIVE", "EXPIRED"];

// notification/entity/NotificationType.java
export const NOTIFICATION_TYPES = [
  "BOOKING",
  "WAITLIST",
  "SHARING",
  "MAINTENANCE",
  "CALIBRATION",
];

export const MAINTENANCE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
