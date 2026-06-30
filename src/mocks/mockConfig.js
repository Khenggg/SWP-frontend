export const MOCK_FLAGS = {
  PUBLIC_PARKING_INFO: "VITE_MOCK_PUBLIC_PARKING_INFO",
  PUBLIC_PRICING: "VITE_MOCK_PUBLIC_PRICING",
  PUBLIC_AVAILABLE_SLOTS: "VITE_MOCK_PUBLIC_AVAILABLE_SLOTS",
  DRIVER_BOOKINGS: "VITE_MOCK_DRIVER_BOOKINGS",
  DRIVER_HISTORY: "VITE_MOCK_DRIVER_HISTORY",
  AUTH_LOGIN: "VITE_MOCK_AUTH_LOGIN",
  MANAGER_CARDS: "VITE_MOCK_MANAGER_CARDS",
  MANAGER_PASSES: "VITE_MOCK_MANAGER_PASSES",
  MANAGER_STRUCTURES: "VITE_MOCK_MANAGER_STRUCTURES",
  MANAGER_PRICING: "VITE_MOCK_MANAGER_PRICING",
  ADMIN_USERS: "VITE_MOCK_ADMIN_USERS",
  MANAGER_DASHBOARD: "VITE_MOCK_MANAGER_DASHBOARD",
  ADMIN_AUDIT: "VITE_MOCK_ADMIN_AUDIT",
  ADMIN_SESSIONS: "VITE_MOCK_ADMIN_SESSIONS",
};

export const API_BASE_URLS = {
  core: import.meta.env.VITE_CORE_API_URL || "http://localhost:5000/api/core",
  public: import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8080/api/public",
  support: import.meta.env.VITE_SUPPORT_API_URL || "http://localhost:8080/api/support",
};

export function isMockEnabled(flagName) {
  return import.meta.env[flagName] === "true";
}

export function hasEnabledMocks() {
  if (import.meta.env.VITE_USE_MOCK !== "true") {
    return false;
  }
  // Avoid Object.entries(import.meta.env) which fails in Vite builds
  return Object.values(MOCK_FLAGS).some(
    (flag) => import.meta.env[flag] === "true"
  );
}

