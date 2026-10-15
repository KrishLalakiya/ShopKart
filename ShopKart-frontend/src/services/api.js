import axios from "axios";

const api = axios.create({
    // server root, not /customers - so the same instance can also
    // points at localhost by default, but can be repointed at a deployed
    // backend with VITE_API_URL (see .env.example)
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8082",
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;