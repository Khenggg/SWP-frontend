import axios from "axios";

// Khởi tạo instance Axios cho Support API Service (Spring Boot)
const supportAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_SUPPORT_API_URL || "http://localhost:8080/api/support",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
supportAxiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
supportAxiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("currentUser");
        window.location.href = "/login";
      }

      if (status === 403) {
        window.location.href = "/unauthorized";
      }

      return Promise.reject(error.response.data || error.message);
    }
    
    return Promise.reject({
      success: false,
      message: "Lỗi kết nối mạng đến Support Service.",
    });
  }
);

export default supportAxiosClient;
