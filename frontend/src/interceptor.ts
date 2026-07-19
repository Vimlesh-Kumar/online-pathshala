import axios from "axios";
import { toast } from "./plugins/toast";
import type { Router } from "vue-router";

const httpInterceptor = (router: Router) => {
    // Add request interceptor
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Return the modified config object
            return config;
        },
        (error) => {
            // Handle request error
            return Promise.reject(error);
        }
    );

    // Surface unreachable-backend errors globally — callers still handle their own field-level errors.
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (!error.response) {
                toast.error("Can't reach the server — check your connection and try again.");
            } else if (error.response.status === 403) {
                // Only redirect if the user had a token (session expired).
                // If there's no token, the user is browsing publicly — don't interrupt.
                if (localStorage.getItem("token")) {
                    localStorage.removeItem("token");
                    toast.error("Session expired. Please log in again.");
                    router.push("/user/sign-in");
                }
            }
            return Promise.reject(error);
        }
    );
};
export default httpInterceptor;
