// Minimal, dependency-free JWT payload decoder. We only ever need to read
// claims client-side (email/sub, role, exp) - verification always happens
// on the backend.
export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Failed to decode JWT", err);
    return null;
  }
}

export function isTokenExpired(token) {
  const claims = decodeJwt(token);
  if (!claims || !claims.exp) return false;
  return Date.now() >= claims.exp * 1000;
}
