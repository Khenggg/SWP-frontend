import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Shield, Clock, Send, Info, ArrowLeft, ArrowRight, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import AuthSplitLayout from "@/components/layout/AuthSplitLayout";

const FORGOT_PASSWORD_FEATURES = [
  {
    icon: "P",
    title: "Quản lý bãi xe thông minh",
    description: "Tiện lợi, nhanh chóng"
  },
  {
    icon: <Shield size={20} />,
    title: "An toàn & bảo mật",
    description: "Hệ thống giám sát 24/7"
  },
  {
    icon: <Clock size={20} />,
    title: "Tiết kiệm thời gian",
    description: "Tối ưu trải nghiệm đỗ xe"
  }
];

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setError("Vui lòng nhập email hoặc số điện thoại.");
      return;
    }

    setIsLoading(true);

    // Giả lập thời gian xử lý và hiển thị thông báo tính năng chưa khả dụng
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Tính năng khôi phục mật khẩu đang được phát triển và hiện chưa khả dụng. Vui lòng liên hệ bộ phận hỗ trợ.");
    }, 1500);
  };

  return (
    <AuthSplitLayout
      title="Đỗ xe thông minh"
      heroDescription="Trải nghiệm tiện lợi An tâm mỗi ngày"
      featureItems={FORGOT_PASSWORD_FEATURES}
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
          <div className="relative">
            <Unlock size={28} strokeWidth={2} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Quên mật khẩu</h2>
        <p className="text-center text-sm text-gray-500 max-w-[300px]">
          Nhập email hoặc số điện thoại đã đăng ký. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      {successMessage && (
        <Alert variant="default">{successMessage}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Email hoặc số điện thoại
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
              <Mail size={18} />
            </span>
            <Input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="pl-11 pr-4 py-6 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
              placeholder="Nhập email hoặc số điện thoại"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-base font-bold shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Gửi yêu cầu khôi phục</span>
            </>
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

      <div className="flex items-center justify-between mt-6">
        <Link to="/login" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft size={16} />
          <span>Quay lại đăng nhập</span>
        </Link>
        <Link to="/register" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
          <span>Đăng ký tài khoản</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <Alert variant="default" className="mt-8">
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Vui lòng kiểm tra email của bạn</h4>
          <p className="text-xs font-medium text-blue-900/80 leading-relaxed">
            Sau khi gửi yêu cầu, vui lòng kiểm tra hộp thư đến và cả thư mục Spam để không bỏ lỡ email từ hệ thống.
          </p>
        </div>
      </Alert>
    </AuthSplitLayout>
  );
}
