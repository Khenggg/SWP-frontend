import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";

const NAV_ITEMS = [
  { label: "Trang chủ", path: "/" },
  { label: "Thông tin bãi xe", path: "/parking-info" },
  { label: "Bảng giá", path: "/pricing" },
  { label: "Chỗ trống", path: "/available-slots" },
  { label: "Quy định", path: "/rules" },
];

const CONTACT_INFO = [
  { icon: "📞", text: "1900 1234" },
  { icon: "✉️", text: "support@swpbuilding.vn" },
  { icon: "📍", text: "Lô HH-01, KCN SWP, Thị trấn SWP, Huyện SWP, Tỉnh SWP" },
];

export default function PublicLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-800 font-sans">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 text-white">
              <span className="font-black text-sm tracking-tight">P</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-wide text-blue-700 uppercase">SWP Building</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Smart Parking</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  isActive(item.path)
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Đăng Nhập
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Đăng Nhập
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0f1d3a] border-t border-[#1a2b4c] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Col 1: Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-[#0f1d3a] font-black text-sm">P</div>
                <div className="leading-tight">
                  <div className="text-sm font-black text-white uppercase">SWP Building</div>
                  <div className="text-[10px] text-blue-200/70 uppercase tracking-wider font-semibold">Smart Parking</div>
                </div>
              </Link>
              <p className="text-xs text-blue-100/70 leading-relaxed mt-2">
                Hệ thống bãi đỗ xe thông minh tại SWP Building. An toàn - Tiện lợi - Hiện đại.
              </p>
            </div>

            {/* Col 2: Contact */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Liên hệ</h4>
              <ul className="space-y-2.5">
                {CONTACT_INFO.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-blue-100/70">
                    <span className="mt-0.5 text-blue-300">{item.icon}</span>
                    <span className="leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#1a2b4c] py-4 text-center text-xs text-blue-200/50">
          © 2024 SWP Building Smart Parking System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
