import React from "react";
import { Link } from "react-router-dom";

/**
 * UnauthorizedPage - Trang báo lỗi 403 (Từ chối truy cập)
 * Thiết kế tối giản, độ tương phản cao cho nhân viên
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="rounded-full bg-amber-100 p-4 text-amber-700 border border-amber-200">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-8V7m0 0v2m0-2h.01M4.93 4.93l14.14 14.14" />
        </svg>
      </div>

      <h1 className="mt-6 text-4xl font-black text-slate-900 tracking-tight">
        403 - Từ Chối Quyền Truy Cập
      </h1>

      <p className="mt-3 text-slate-600 max-w-md text-sm font-medium">
        Tài khoản của bạn không được phân quyền để truy cập vào phân mục này. Vui lòng liên hệ Admin.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded bg-blue-700 hover:bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
        >
          Về Trang Chủ Công Cộng
        </Link>
        <Link
          to="/login"
          className="rounded border border-slate-300 hover:bg-slate-100 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors"
        >
          Đăng Nhập Tài Khoản Khác
        </Link>
      </div>
    </div>
  );
}
