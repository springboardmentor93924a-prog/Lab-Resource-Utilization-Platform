export function getCurrentUserId() {

  const token = localStorage.getItem("token");

  if (!token) return null;

  try {

    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload.userId || null;

  } catch {

    return null;

  }

}


export function getCurrentUserRole() {

  const token = localStorage.getItem("token");

  if (!token) return null;

  try {

    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload.role || null;

  } catch {

    return null;

  }

}


/*
 * General admin-level access.
 *
 * Keep this unchanged because other parts
 * of the application may use it.
 */
export function isAdmin() {

  const role = getCurrentUserRole();

  return (
    role === "INSTITUTION_ADMIN" ||
    role === "SYSTEM_ADMIN" ||
    role === "LAB_MANAGER" ||
    role === "DEPARTMENT_HEAD"
  );

}


/*
 * Equipment management permission.
 *
 * According to RBAC:
 *
 * SYSTEM_ADMIN       → YES
 * INSTITUTION_ADMIN  → YES
 * LAB_MANAGER        → YES
 *
 * DEPARTMENT_HEAD    → NO
 * LAB_TECHNICIAN     → NO
 * RESEARCHER         → NO
 * STUDENT            → NO
 */
export function canManageEquipment() {

  const role = getCurrentUserRole();

  return (
    role === "SYSTEM_ADMIN" ||
    role === "INSTITUTION_ADMIN" ||
    role === "LAB_MANAGER"
  );

}


export function canMakePriorityBooking() {

  const role = getCurrentUserRole();

  return (
    role === "RESEARCHER" ||
    role === "INSTITUTION_ADMIN" ||
    role === "SYSTEM_ADMIN"
  );

}