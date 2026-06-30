import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldAlert, Users, Car, CalendarCheck, Shield, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import AuthSplitLayout from "@/components/layout/AuthSplitLayout";

const REGISTER_FEATURES = [
  {
    icon: <Car size={20} />,
    title: "Tìm chỗ đỗ nhanh chóng",
    description: "Xem vị trí trống theo thời gian thực."
  },
  {
    icon: "P",
    title: "Đặt chỗ tiện lợi",
    description: "Đặt trước và giữ chỗ dễ dàng."
  },
  {
    icon: <Shield size={20} />,
    title: "An toàn & bảo mật",
    description: "Hệ thống giám sát 24/7."
  },
  {
    icon: <Receipt size={20} />,
    title: "Thanh toán linh hoạt",
    description: "Nhiều phương thức thanh toán."
  }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!agreeTerms) {
      setError("Bạn cần đồng ý với điều khoản sử dụng.");
      return;
    }

    setIsLoading(true);

    // Giả lập thời gian xử lý và hiển thị thông báo tính năng chưa khả dụng
    setTimeout(() => {
      setIsLoading(false);
      setInfoMessage("Tính năng đăng ký tài khoản đang được phát triển và hiện chưa khả dụng. Vui lòng thử lại sau.");
    }, 1500);
  };

  return (
    <AuthSplitLayout
      title="Đăng ký để trải nghiệm"
      heroDescription="Giải pháp bãi đỗ xe thông minh, hiện đại và an toàn mang đến trải nghiệm tiện lợi cho mọi khách hàng."
      featureItems={REGISTER_FEATURES}
    >
      <div className="flex flex-col mb-6">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Đăng ký tài khoản</h2>
        <p className="text-sm text-gray-500">
          Tạo tài khoản để sử dụng các tính năng của<br />SWP Building Smart Parking.
        </p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-6 flex items-center gap-3">
        <Users size={20} className="text-blue-600 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-900/80">
          Dành cho người dùng/ tài xế cá nhân sử dụng dịch vụ.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      {infoMessage && (
        <Alert variant="default">{infoMessage}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <User size={18} />
          </span>
          <Input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="pl-11 pr-4 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Họ và tên"
          />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Mail size={18} />
          </span>
          <Input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="pl-11 pr-4 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Email"
          />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Phone size={18} />
          </span>
          <Input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="pl-11 pr-4 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Số điện thoại"
          />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Lock size={18} />
          </span>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="pl-11 pr-11 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
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

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Lock size={18} />
          </span>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="pl-11 pr-11 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Xác nhận mật khẩu"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 pl-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10 bg-transparent hover:bg-transparent"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>

        <div className="pt-2 pb-3">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5" />
            <span className="text-xs text-gray-600 leading-relaxed">
              Tôi đồng ý với <a href="#" className="text-blue-600 font-medium hover:underline">điều khoản sử dụng</a> và <a href="#" className="text-blue-600 font-medium hover:underline">chính sách bảo mật</a>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-base font-bold shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            "Tạo tài khoản"
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

      <div className="text-center">
        <span className="text-sm text-gray-600">Đã có tài khoản? </span>
        <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
          Đăng nhập
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
