import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parkingService } from "@/services/parkingService";
import { MapPin, Phone, Clock, Shield, CarFront, DollarSign, List, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  OPEN:        { label: "Đang mở cửa",  dot: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200" },
  CLOSED:      { label: "Đã đóng cửa", dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200" },
  MAINTENANCE: { label: "Bảo trì",      dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

const SERVICES = [
  { icon: <Info size={22} className="text-blue-600" />, label: "Thông tin bãi xe",  desc: "Tìm hiểu về vị trí, tiện ích và hướng dẫn di chuyển", to: "/parking-info" },
  { icon: <DollarSign size={22} className="text-blue-600" />, label: "Bảng giá",    desc: "Xem bảng giá gửi xe theo giờ và theo tháng",          to: "/pricing" },
  { icon: <CarFront size={22} className="text-blue-600" />,   label: "Chỗ trống",   desc: "Xem số lượng chỗ trống theo tầng thời gian thực",     to: "/available-slots" },
  { icon: <List size={22} className="text-blue-600" />,       label: "Quy định",    desc: "Xem quy định gửi xe và các lưu ý quan trọng",         to: "/rules" },
];

function StatCard({ icon, title, value, sub, live }) {
  return (
    <Card className="flex items-center gap-4 hover:shadow-md transition-shadow p-5 border-gray-100">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{title}</p>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        {sub && (
          <p className="text-xs mt-1 flex items-center gap-1.5 text-gray-500">
            {live && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />}
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}

export default function ParkingInfoPage() {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parkingService.getParkingInfo();
      setInfo(data);
    } catch {
      setError("Không tải được thông tin bãi xe.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, []);

  const statusCfg = STATUS_CONFIG[info?.status] || STATUS_CONFIG["CLOSED"];

  return (
    <div className="bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="/images/parking-hero.jpg"
          alt="SWP Building Parking"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
          <p className="text-white/70 text-sm font-semibold mb-1">Chào mừng đến với</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-1 leading-tight">
            SWP BUILDING
          </h1>
          <p className="text-blue-400 text-xl font-bold mb-4">SMART PARKING</p>
          <p className="text-white/80 text-sm max-w-sm leading-relaxed mb-6">
            Giải pháp bãi đỗ xe thông minh, hiện đại và an toàn<br />
            trải nghiệm tiện lợi cho mọi khách hàng
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/available-slots"
            >
              <Button className="font-semibold text-sm h-11 px-5">
                <CarFront size={16} className="mr-2" /> Xem chỗ trống
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100" />)}
          </div>
        ) : error ? (
          <Card className="bg-red-50 border border-red-200 p-5 text-center shadow-none">
            <p className="text-red-600 text-sm font-semibold mb-3">{error}</p>
            <Button variant="outline" onClick={fetchInfo} className="h-8 text-xs text-blue-600 font-semibold hover:text-blue-700">Thử lại</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<CarFront size={22} className="text-blue-600" />}
              title="Tổng chỗ đỗ xe"
              value={info.totalCapacity?.toLocaleString("vi-VN") || "–"}
              sub="Toàn bộ tòa nhà"
            />
            <StatCard
              icon={<span className="text-2xl font-black text-blue-600">P</span>}
              title="Chỗ trống hiện tại"
              value={info.availableSlots?.toLocaleString("vi-VN") || "–"}
              sub="Cập nhật 1 phút trước"
              live
            />
            <StatCard
              icon={<Clock size={22} className="text-blue-600" />}
              title="Giờ hoạt động"
              value={info.openingHours || "–"}
              sub="Tất cả các ngày"
            />
            <StatCard
              icon={<Shield size={22} className="text-blue-600" />}
              title="An toàn & Bảo mật"
              value="24/7"
              sub="Hệ thống giám sát"
            />
          </div>
        )}
      </div>

      {/* ===== CONTACT INFO STRIP ===== */}
      {!isLoading && !error && info && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <Card className="p-4 flex flex-wrap gap-6 items-center shadow-sm border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={15} className="text-blue-600 flex-shrink-0" />
              <span>{info.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={15} className="text-blue-600 flex-shrink-0" />
              <span>{info.hotline}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={15} className="text-blue-600 flex-shrink-0" />
              <span>Mở cửa: {info.openingHours}</span>
            </div>
            {info.status && (
              <Badge className={`ml-auto px-3 py-1 font-bold flex items-center gap-1.5 ${statusCfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </Badge>
            )}
          </Card>
        </div>
      )}

      {/* ===== SERVICES SECTION ===== */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-xl font-black text-gray-800 mb-6">Khám phá dịch vụ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SERVICES.map((svc) => (
            <Link
              key={svc.label}
              to={svc.to}
            >
              <Card className="group h-full p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  {svc.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 mb-1">{svc.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{svc.desc}</p>
                </div>
                <span className="text-blue-600 text-sm font-bold flex items-center gap-1 mt-auto group-hover:gap-2 transition-all">
                  → 
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
