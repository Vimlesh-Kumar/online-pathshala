import axios from "axios";
import { toast } from "./plugins/toast";

const httpInterceptor = () => {
    // Add request interceptor
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");
            config.headers.Authorization= `Bearer ${token}`;
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
            }
            return Promise.reject(error);
        }
    );
};
export default httpInterceptor;
