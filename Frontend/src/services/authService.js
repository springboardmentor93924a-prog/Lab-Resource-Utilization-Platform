import api from "./api";

// =========================================================
// GET CURRENT USER PROFILE
// =========================================================

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};


// =========================================================
// FORGOT PASSWORD
// =========================================================

export const forgotPassword = async (email) => {
  const response = await api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};


// =========================================================
// RESET PASSWORD
// =========================================================

export const resetPassword = async (
  token,
  password
) => {
  const response = await api.post(
    "/auth/reset-password",
    {
      token,
      password,
    }
  );

  return response.data;
};