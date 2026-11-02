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

const ADMIN_ROLES = [
  "LAB_MANAGER",
  "DEPARTMENT_HEAD",
  "INSTITUTION_ADMINISTRATOR",
  "SYSTEM_ADMINISTRATOR",
];

export function isAdmin() {
  const role = getCurrentUserRole();
  return ADMIN_ROLES.includes(role);
}

export function canMakePriorityBooking() {
  const role = getCurrentUserRole();
  return (
    role === "RESEARCHER_STUDENT" ||
    role === "INSTITUTION_ADMINISTRATOR" ||
    role === "SYSTEM_ADMINISTRATOR"
  );
}
