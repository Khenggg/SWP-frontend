import React from "react";
import { Link } from "react-router-dom";

/**
 * NotFoundPage - Trang báo lỗi 404 (Không tìm thấy trang)
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="rounded-full bg-red-100 p-4 text-red-600 border border-red-200">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 className="mt-6 text-4xl font-black text-slate-900 tracking-tight">
        404 - Không Tìm Thấy Trang
      </h1>
      
      <p className="mt-3 text-slate-600 max-w-md text-sm font-medium">
        Đường dẫn bạn truy cập hiện tại không tồn tại hoặc đã được chuyển sang khu vực khác.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded bg-blue-700 hover:bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
        >
          Quay lại trang chủ
        </Link>
        <button
          onClick={() => window.history.back()}
          className="rounded border border-slate-300 hover:bg-slate-100 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors"
        >
          Quay lại trang trước
        </button>
      </div>
    </div>
  );
}
