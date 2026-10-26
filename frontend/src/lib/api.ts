
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let sessionExpiredEventDispatched = false;

// Dispatch a single event when an authenticated API request returns 401.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url ?? "";

    // Don't expire the session for failed login attempts.
    const isLoginRequest = /\/users\/login\/?$/.test(url);

    if (
      typeof window !== "undefined" &&
      status === 401 &&
      !isLoginRequest &&
      !sessionExpiredEventDispatched
    ) {
      sessionExpiredEventDispatched = true;

      window.dispatchEvent(new Event("app:session-expired"));
    }

    return Promise.reject(error);
  },
);
