import api from "./api";


// =========================================================
// GET USER SETTINGS
// =========================================================

export const getUserSettings =
  async (
    userId
  ) => {

    const response =
      await api.get(
        `/settings/user/${userId}`
      );

    return response.data;
  };


// =========================================================
// UPDATE USER SETTINGS
// =========================================================

export const updateUserSettings =
  async (
    userId,
    settings
  ) => {

    const response =
      await api.put(
        `/settings/user/${userId}`,
        settings
      );

    return response.data;
  };


// =========================================================
// RESET USER SETTINGS
// =========================================================

export const resetUserSettings =
  async (
    userId
  ) => {

    const response =
      await api.post(
        `/settings/user/${userId}/reset`
      );

    return response.data;
  };