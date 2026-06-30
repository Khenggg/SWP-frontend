import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ShieldAlert, ShieldCheck, BarChart3, Clock, Shield } from "lucide-react";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { USER_ROLES } from "@/constants";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import AuthSplitLayout from "@/components/layout/AuthSplitLayout";

const LOGIN_FEATURES = [
  {
    icon: "P",
    title: "Quản lý bãi xe thông minh",
    description: "Theo dõi sức chứa và tình trạng chỗ trống theo thời gian thực."
  },
  {
    icon: <Shield size={20} />,
    title: "An toàn & bảo mật",
    description: "Hệ thống giám sát 24/7, dữ liệu được bảo mật tuyệt đối."
  },
  {
    icon: <Clock size={20} />,
    title: "Tiện lợi & nhanh chóng",
    description: "Đặt chỗ, thanh toán và kiểm soát ra vào dễ dàng."
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Báo cáo & thống kê",
    description: "Cung cấp báo cáo chi tiết, hỗ trợ ra quyết định hiệu quả."
  }
];

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { token, user } = await authService.login(username, password);
      onLoginSuccess(token, user);

      if (user.role === USER_ROLES.ADMIN) {
        navigate("/admin/users");
      } else if (user.role === USER_ROLES.MANAGER) {
        navigate("/manager/dashboard");
      } else if (user.role === USER_ROLES.DRIVER) {
        navigate("/driver/profile");
      } else {
        navigate("/staff/entry");
      }
    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Chào mừng trở lại với"
      heroDescription="Giải pháp bãi đỗ xe thông minh, hiện đại và an toàn mang đến trải nghiệm tiện lợi cho mọi khách hàng."
      featureItems={LOGIN_FEATURES}
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
          <Lock size={28} strokeWidth={2} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Đăng nhập</h2>
        <p className="text-center text-sm text-gray-500">
          Vui lòng đăng nhập để truy cập hệ thống quản lý<br />SWP Building Smart Parking.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <User size={18} />
          </span>
          <Input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-11 pr-4 py-6 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Tên đăng nhập / Email / Số điện thoại"
          />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Lock size={18} />
          </span>
          <Input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-11 py-6 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Mật khẩu"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 pl-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10 bg-transparent hover:bg-transparent"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>

        <div className="flex items-center justify-between pt-1 pb-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <span className="text-sm font-medium text-gray-600 select-none">Ghi nhớ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-base font-bold shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>

      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-400">hoặc</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
        <Link to="/register" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
          Đăng ký
        </Link>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-blue-900/80 leading-relaxed">
          Khu vực dành riêng cho nhân viên, quản lý và quản trị viên. Vui lòng không chia sẻ thông tin đăng nhập.
        </p>
      </div>
    </AuthSplitLayout>
  );
}
