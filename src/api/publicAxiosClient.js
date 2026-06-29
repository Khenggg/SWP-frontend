import axios from "axios";

// Khởi tạo instance Axios cho Public API Service (Spring Boot)
const publicAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8080/api/public",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor
publicAxiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data || error.message);
    }
    
    return Promise.reject({
      success: false,
      message: "Lỗi kết nối mạng đến Public Service.",
    });
  }
);

export default publicAxiosClient;
