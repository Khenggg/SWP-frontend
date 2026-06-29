import axios from "axios";

// Khởi tạo instance Axios cho Core API Service (.NET)
const coreAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_CORE_API_URL || "http://localhost:5000/api/core",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Tự động đính kèm accessToken vào tiêu đề xác thực
coreAxiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Chuẩn hóa phản hồi và xử lý lỗi chung (401, 403, validation, network)
coreAxiosClient.interceptors.response.use(
  (response) => {
    // Trả về phần dữ liệu của phản hồi
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Hết phiên đăng nhập -> tự động xóa token và đá về /login
      if (status === 401) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("currentUser");
        window.location.href = "/login";
      }

      // Không có quyền truy cập -> chuyển sang trang unauthorized
      if (status === 403) {
        window.location.href = "/unauthorized";
      }

      return Promise.reject(error.response.data || error.message);
    }
    
    // Lỗi không có phản hồi từ mạng (Network Error)
    return Promise.reject({
      success: false,
      message: "Lỗi kết nối mạng đến Core Service. Vui lòng liên hệ bộ phận kỹ thuật.",
    });
  }
);

export default coreAxiosClient;
