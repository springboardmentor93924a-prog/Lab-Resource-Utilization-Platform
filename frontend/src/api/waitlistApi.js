import { apiFetch } from "./client";

export const waitlistApi = {
  join: (payload) => apiFetch("/waitlists", { method: "POST", body: payload }),
  myWaitlist: () => apiFetch("/waitlists/my"),
  confirm: (waitlistId) => apiFetch(`/waitlists/${waitlistId}/confirm`, { method: "POST" }),
};
