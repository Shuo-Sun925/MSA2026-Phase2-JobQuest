import axios from "axios";

let getAccessToken: (() => string | null) | null = null;
let handleUnauthorized: (() => void) | null = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5065/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken?.() ?? null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadAccessToken = Boolean(getAccessToken?.());

    if (error.response?.status === 401 && hadAccessToken) {
      handleUnauthorized?.();
    }

    return Promise.reject(error);
  },
);

export function configureApiAuth(options: {
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getAccessToken = options.getAccessToken;
  handleUnauthorized = options.onUnauthorized;
}

export default api;