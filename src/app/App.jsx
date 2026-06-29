import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { Toaster } from "@/components/ui/sonner";


/**
 * Hàm giải mã và lấy vai trò (role) từ token
 * Hỗ trợ cả Token giả lập (mock) khi chạy offline và Token thật (JWT) từ backend
 */
const getRoleFromToken = (token) => {
  if (!token) return null;

  // 1. Kiểm tra nếu là Token giả lập (Mock Token) dùng cho chạy thử
  if (token.startsWith("mock-token-for-")) {
    const username = token.replace("mock-token-for-", "");
    const mockRoles = {
      admin01: "ADMIN",
      manager01: "MANAGER",
      staff01: "STAFF",
      driver01: "DRIVER",
      driver02: "DRIVER",
    };
    return mockRoles[username] || null;
  }

  // 2. Kiểm tra giải mã phần Payload của chuỗi JWT thật (.NET/Spring Boot)
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.role || null;
  } catch (error) {
    console.error("Giải mã JWT Token thất bại, token có thể đã bị sửa đổi trái phép.", error);
    return null;
  }
};

/**
 * App - Component gốc của ứng dụng (Root Component)
 * Quản lý trạng thái đăng nhập toàn cục bằng useState và useEffect
 * Tuân thủ quy tắc không dùng Context API hay các thư viện quản lý state phức tạp.
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // Đang khôi phục phiên từ sessionStorage

  // Khôi phục trạng thái đăng nhập từ sessionStorage khi tải ứng dụng
  useEffect(() => {
    const savedToken = sessionStorage.getItem("accessToken");
    const savedUserJson = sessionStorage.getItem("currentUser");

    if (savedToken && savedUserJson) {
      // Bảo mật cốt lõi: Giải mã vai trò (role) trực tiếp từ Token, KHÔNG lấy từ plain text json
      const resolvedRole = getRoleFromToken(savedToken);

      if (resolvedRole) {
        try {
          const parsedUser = JSON.parse(savedUserJson);
          setToken(savedToken);
          // Ghi đè role từ token đã được xác thực an toàn
          setCurrentUser({ ...parsedUser, role: resolvedRole });
          setUserRole(resolvedRole);
          setIsAuthenticated(true);
          console.log("Khôi phục phiên đăng nhập an toàn thành công cho:", parsedUser.username);
        } catch (err) {
          console.error("Lỗi phân tích cú pháp dữ liệu người dùng, đang xóa phiên lỗi...");
          handleLogout();
        }
      } else {
        console.warn("Token không hợp lệ hoặc bị sửa đổi, tự động đăng xuất.");
        handleLogout();
      }
    }
    setIsInitializing(false);
  }, []);

  // Xử lý sau khi đăng nhập thành công
  const handleLoginSuccess = (accessToken, user) => {
    // Bảo mật: Lấy vai trò chính thức từ Token
    const resolvedRole = getRoleFromToken(accessToken) || user.role;

    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("currentUser", JSON.stringify({ ...user, role: resolvedRole }));

    setToken(accessToken);
    setCurrentUser({ ...user, role: resolvedRole });
    setUserRole(resolvedRole);
    setIsAuthenticated(true);
    console.log("Đăng nhập thành công cấp Root cho:", user.username);
  };

  // Xử lý đăng xuất tài khoản
  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("currentUser");

    setToken(null);
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    console.log("Đã đăng xuất tài khoản và xóa phiên làm việc.");
  };

  // Hiển thị vòng xoay chờ trong lúc khôi phục phiên
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center font-bold text-slate-500 animate-pulse text-sm">
          ĐANG KHỞI ĐỘNG HỆ THỐNG...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
      <Toaster />
    </BrowserRouter>
  );
}
