import axios from "axios";

const httpInterceptor = () => {
    // Add request interceptor
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");
            config.headers["Authorization"] = `Bearer ${token}`;
            // Return the modified config object
            return config;
        },
        (error) => {
            // Handle request error
            return Promise.reject(error);
        }
    );
};
export default httpInterceptor;
