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

export function isAdmin() {
  const role = getCurrentUserRole();
  return role === "INSTITUTION_ADMIN" || role === "SYSTEM_ADMIN";
}

export function canMakePriorityBooking() {
  const role = getCurrentUserRole();
  return role === "RESEARCHER" || role === "INSTITUTION_ADMIN" || role === "SYSTEM_ADMIN";
}