import apiClient from "./client";

// BookingRequestDTO shape: { equipId, startTime, endTime } (LocalDateTime as "YYYY-MM-DDTHH:mm:ss")
// IMPORTANT: never send requestedById / userEmail / requesterId - backend derives the
// requester from the JWT (auth.getName()).

// POST /api/bookings/create
export function createBooking(payload) {
  return apiClient.post("/api/bookings/create", payload).then((res) => res.data);
}

// GET /api/bookings -> BookingResponseDTO[] (there is no "my bookings" endpoint yet -
// see README notes; the frontend filters this list by the logged-in user's email/id)
export function getAllBookings() {
  return apiClient.get("/api/bookings").then((res) => res.data);
}

// GET /api/bookings/{id}
export function getBookingById(bookingId) {
  return apiClient.get(`/api/bookings/${bookingId}`).then((res) => res.data);
}

// PUT /api/bookings/update/{id}
export function updateBooking(bookingId, payload) {
  return apiClient.put(`/api/bookings/update/${bookingId}`, payload).then((res) => res.data);
}

// PUT /api/bookings/approve/{id} - no body
export function approveBooking(bookingId) {
  return apiClient.put(`/api/bookings/approve/${bookingId}`).then((res) => res.data);
}

// PUT /api/bookings/reject/{id} - no body
export function rejectBooking(bookingId) {
  return apiClient.put(`/api/bookings/reject/${bookingId}`).then((res) => res.data);
}

// PUT /api/bookings/cancel/{id} - no body
export function cancelBooking(bookingId) {
  return apiClient.put(`/api/bookings/cancel/${bookingId}`).then((res) => res.data);
}

// ---- Waitlist: /api/waitlist (GET-only today, all public per SecurityConfig) ----

// GET /api/waitlist
export function getAllWaitlistEntries() {
  return apiClient.get("/api/waitlist").then((res) => res.data);
}

// GET /api/waitlist/{waitlistId}
export function getWaitlistById(waitlistId) {
  return apiClient.get(`/api/waitlist/${waitlistId}`).then((res) => res.data);
}

// GET /api/waitlist/equipment/{equipmentId}
export function getWaitlistByEquipment(equipmentId) {
  return apiClient.get(`/api/waitlist/equipment/${equipmentId}`).then((res) => res.data);
}
