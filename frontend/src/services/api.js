import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://lab-resource-utilization-platform-obc7.onrender.com/api",

    headers: {
        "Content-Type": "application/json",
    },
});

// Tracks how many API requests are currently in flight so the
// UI can show a loading indicator instead of looking frozen
// while the (remote) database answers.
let pendingRequests = 0;

function emitActivity() {
    window.dispatchEvent(
        new CustomEvent("api-activity", {
            detail: { pending: pendingRequests },
        })
    );
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        pendingRequests += 1;
        emitActivity();

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        emitActivity();
        return response;
    },
    (error) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        emitActivity();

        if (error.response && error.response.status === 401) {
            localStorage.clear();
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Extract a human-readable error message from an Axios error response.
 * Handles Spring Boot validation errors which return:
 *   { message: "Validation failed", errors: { field: "msg", ... } }
 */
export function extractErrorMessage(err, fallback = "An unexpected error occurred.") {
    const data = err?.response?.data;
    if (!data) {
        return err?.message || fallback;
    }
    if (data.errors && typeof data.errors === "object") {
        const messages = Object.values(data.errors);
        if (messages.length > 0) return messages.join(", ");
    }
    if (data.message) return data.message;
    if (typeof data === "string") return data;
    return fallback;
}

export default api;
