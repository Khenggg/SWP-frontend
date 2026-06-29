import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, Car, Calendar, Shield, ArrowRight } from "lucide-react";
import { vehicleService } from "../../services/vehicleService";
import { bookingService } from "../../services/bookingService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PASS_STATUS, USER_ROLES } from "@/constants";

export default function DriverProfilePage() {
  const [driver, setDriver] = useState(() => {
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Lỗi đọc thông tin user", e);
      }
    }
    return {
      username: "",
      fullName: "",
      email: "",
      phone: "",
      role: USER_ROLES.DRIVER,
    };
  });

  const [vehicleStats, setVehicleStats] = useState({ active: 0, expired: 0, total: 0 });
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    // 1. Lấy thông tin tài khoản từ sessionStorage
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setDriver(prev => ({
          ...prev,
          ...parsed,
        }));
      } catch (e) {
        console.error("Lỗi đọc thông tin user", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 2. Đếm số xe của tài xế này từ vehicleService (lấy xe thuộc sở hữu dựa trên token)
        const myPasses = await vehicleService.getVehiclesByOwner();
        const active = myPasses.filter((p) => p.status === PASS_STATUS.ACTIVE).length;
        const expired = myPasses.filter((p) => p.status === PASS_STATUS.EXPIRED).length;
        setVehicleStats({
          active,
          expired,
          total: myPasses.length,
        });

        // 3. Đếm số booking từ bookingService
        const savedHistory = await bookingService.getHistory();
        const activeBookingData = await bookingService.getActiveBooking();
        const hasActiveBooking = activeBookingData ? 1 : 0;
        setBookingCount(savedHistory.length + hasActiveBooking);
      } catch (e) {
        console.error("Lỗi lấy thông tin thống kê:", e);
      }
    };

    fetchStats();
  }, [driver]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Pattern Elements */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <svg width="260" height="260" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
        <div className="absolute top-0 right-1/4 opacity-5">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <rect x="10" y="10" width="80" height="80" rx="15" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/20 shrink-0 select-none">
            👨‍✈️
          </div>
          <div className="text-center md:text-left flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <h2 className="text-3xl font-black tracking-tight">{driver.fullName}</h2>
              <Badge variant="outline" className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase border border-white/15">
                {driver.username === "driver01" ? "CƯ DÂN" : "TÀI XẾ ĐẶT TRƯỚC"}
              </Badge>
            </div>
            <p className="text-blue-100 font-medium text-sm mb-4">
              {driver.username === "driver01" ? "Tài khoản Cư dân có liên kết vé tháng" : "Tài khoản đặt trước thông thường (Không cư dân)"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-white/95">
              <span className="bg-slate-950/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                <Phone className="w-3.5 h-3.5 text-blue-300" /> {driver.phone}
              </span>
              <span className="bg-slate-950/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                <Mail className="w-3.5 h-3.5 text-indigo-300" /> {driver.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid thông số tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Xe */}
        <Card className="shadow-sm hover:shadow-md transition duration-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-900/10">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xe của tôi</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mb-1">{vehicleStats.total} Xe</p>
          <div className="flex gap-3 text-xs font-bold text-slate-500">
            <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border-0">
              {vehicleStats.active} Hạn Vé Tháng
            </Badge>
            {vehicleStats.expired > 0 && (
              <Badge variant="secondary" className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border-0">
                {vehicleStats.expired} Hết Hạn
              </Badge>
            )}
          </div>
        </Card>

        {/* Card Booking */}
        <Card className="shadow-sm hover:shadow-md transition duration-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-900/10">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Đặt Chỗ</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mb-1">{bookingCount} Đợt đặt</p>
          <CardDescription className="text-xs font-semibold">Theo dõi lịch sử đặt trước và trạng thái thanh toán</CardDescription>
        </Card>

        {/* Card Loại tài khoản */}
        <Card className="shadow-sm hover:shadow-md transition duration-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl dark:bg-purple-900/10">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loại tài khoản</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mb-1">
            {driver.username === "driver01" ? "Cư Dân" : "Tài Xế Đặt Trước"}
          </p>
          <CardDescription className="text-xs font-semibold">
            {driver.username === "driver01" 
              ? "Đăng ký vé tháng dài hạn & đặt chỗ trước trực tuyến" 
              : "Đặt chỗ trước trực tuyến qua App & đỗ xe trả phí theo giờ"}
          </CardDescription>
        </Card>
      </div>

      {/* Lối tắt các nghiệp vụ */}
      <Card className="p-8 shadow-sm">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="font-black text-slate-800 uppercase tracking-wide">Tiện ích dành cho tài xế</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lối tắt 1: Booking */}
          <Link 
            to="/driver/booking" 
            className="flex"
          >
            <Card className="group flex flex-col justify-between p-6 rounded-xl border border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left w-full">
              <div>
                <div className="text-2xl mb-3 select-none">📅</div>
                <h4 className="font-extrabold text-slate-800 mb-2">Đặt Chỗ Trước</h4>
                <CardDescription className="text-xs font-medium leading-relaxed mb-4 text-slate-600">
                  Đặt giữ chỗ trước cho các xe hết hạn vé tháng. Xe còn hạn vé tháng (ACTIVE) đỗ trực tiếp tại slot cố định không cần đặt.
                </CardDescription>
              </div>
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Đặt chỗ ngay <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          {/* Lối tắt 2: Vehicles */}
          <Link 
            to="/driver/vehicles" 
            className="flex"
          >
            <Card className="group flex flex-col justify-between p-6 rounded-xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left w-full">
              <div>
                <div className="text-2xl mb-3 select-none">🚗</div>
                <h4 className="font-extrabold text-slate-800 mb-2">Xe Của Tôi</h4>
                <CardDescription className="text-xs font-medium leading-relaxed mb-4 text-slate-600">
                  Xem danh sách phương tiện được liên kết với thẻ vé tháng của bạn. Được cập nhật bởi Quản lý.
                </CardDescription>
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Xem danh sách xe <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          {/* Lối tắt 3: History */}
          <Link 
            to="/driver/history" 
            className="flex"
          >
            <Card className="group flex flex-col justify-between p-6 rounded-xl border border-purple-100 bg-purple-50/20 hover:bg-purple-50 hover:border-purple-200 transition-all text-left w-full">
              <div>
                <div className="text-2xl mb-3 select-none">⏱️</div>
                <h4 className="font-extrabold text-slate-800 mb-2">Lịch Sử Gửi Xe</h4>
                <CardDescription className="text-xs font-medium leading-relaxed mb-4 text-slate-600">
                  Xem chi tiết lịch sử các phiên đỗ xe thực tế đã hoàn thành, có đối chiếu biển số và chi phí.
                </CardDescription>
              </div>
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Xem lịch sử <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
