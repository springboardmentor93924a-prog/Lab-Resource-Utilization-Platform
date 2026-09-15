import apiClient from "./client";

// POST /auth/login - public, returns { token }
export function login(email, password) {
  return apiClient
    .post("/auth/login", { email, password })
    .then((res) => res.data);
}
