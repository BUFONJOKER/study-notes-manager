import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let sessionExpiredEventDispatched = false;

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url ?? "";

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


// ADD THIS: Response Interceptor to catch 401s (Expired Tokens) Globally
api.interceptors.response.use(
    (response) => response, // Pass successful requests through
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url ?? "";
        const isLoginRequest = url.includes("users/login");
        // Check if FastAPI returned a 401 Unauthorized error
        // if (error.response && error.response.status === 401) {
        //     if (typeof window !== "undefined") {
        //         // Force log out on the client side and send them to the login screen
        //         await signOut({ callbackUrl: "/login" });
        //     }
        // }
        // return Promise.reject(error);
        if (
            typeof window !== "undefined" &&
            status === 401 &&
            !isLoginRequest
        ) {
            window.dispatchEvent(
                new Event("app:session-expired"),
            );
        }

        return Promise.reject(error);
    },
);