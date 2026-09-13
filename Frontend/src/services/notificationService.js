import api from "./api";

// =========================================================
// GET ALL NOTIFICATIONS FOR USER
// =========================================================

export const getNotifications = async (
  userId
) => {
  const response =
    await api.get(
      `/notifications/user/${userId}`
    );

  return response.data;
};


// =========================================================
// GET UNREAD NOTIFICATIONS
// =========================================================

export const getUnreadNotifications =
  async (userId) => {

    const response =
      await api.get(
        `/notifications/user/${userId}/unread`
      );

    return response.data;
  };


// =========================================================
// GET UNREAD COUNT
// =========================================================

export const getUnreadNotificationCount =
  async (userId) => {

    const response =
      await api.get(
        `/notifications/user/${userId}/unread-count`
      );

    return response.data;
  };


// =========================================================
// MARK SINGLE NOTIFICATION AS READ
// =========================================================

export const markNotificationAsRead =
  async (notificationId) => {

    const response =
      await api.put(
        `/notifications/${notificationId}/read`
      );

    return response.data;
  };


// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

export const markAllNotificationsAsRead =
  async (userId) => {

    const response =
      await api.put(
        `/notifications/user/${userId}/read-all`
      );

    return response.data;
  };


// =========================================================
// DELETE NOTIFICATION
// =========================================================

export const deleteNotification =
  async (notificationId) => {

    const response =
      await api.delete(
        `/notifications/${notificationId}`
      );

    return response.data;
  };