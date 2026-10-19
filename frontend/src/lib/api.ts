import axios from "axios";
import { getSession } from "next-auth/react";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Create a pre-configured instance pointing to your FastAPI backend
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30_000,
    headers: {
        "Content-Type": "application/json",
    },
});


// Automatically inject Bearer tokens before requests go out
api.interceptors.request.use(async (config) => {
    const session = await getSession();
    const token = session?.accessToken;

    // Check if we're on the server or client
    // if (typeof window === "undefined") {
    //     const session = await getServerSession(authOptions);
    //     token = session?.accessToken || null;
    // } else {
    //     const session = await getSession();
    //     token = session?.accessToken || null;
    // }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization; // Remove the header if no token is present
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});


// ADD THIS: Response Interceptor to catch 401s (Expired Tokens) Globally
api.interceptors.response.use(
    (response) => response, // Pass successful requests through
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url ?? "";
        const isLoginRequest = url.includes("user/login")
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