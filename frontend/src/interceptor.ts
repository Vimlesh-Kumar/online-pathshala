import axios from "axios";
import { toast } from "./plugins/toast";
import type { Router } from "vue-router";

/**
 * Public /user/ endpoints that don't need a token.
 * Every other /user/* request is silently cancelled when unauthenticated.
 */
const PUBLIC_USER_PATHS = ['/user/signin', '/user/signup', '/user/avatar-file', 'user/signin', 'user/signup', 'user/avatar-file'];

const isAuthRequired = (url: string | undefined): boolean => {
    if (!url) return false;
    // Normalise: strip base URL if axios already resolved it
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    const normalised = path.startsWith('/') ? path : `/${path}`;
    if (!normalised.startsWith('/user')) return false;
    return !PUBLIC_USER_PATHS.some(p => {
        const np = p.startsWith('/') ? p : `/${p}`;
        return normalised.startsWith(np);
    });
};

const httpInterceptor = (router: Router) => {
    // Add request interceptor
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (isAuthRequired(config.url)) {
                // Silently cancel auth-required requests when not logged in
                const controller = new AbortController();
                config.signal = controller.signal;
                controller.abort('AUTH_SKIPPED');
                return config;
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
            // Silently swallow requests we cancelled because the user isn't logged in
            if (axios.isCancel(error)) {
                return Promise.reject(error);
            }

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
