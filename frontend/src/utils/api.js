import { BACKEND_URL } from "./paths";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("auth_token");
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Auto-set Content-Type for JSON, but let browser handle FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
