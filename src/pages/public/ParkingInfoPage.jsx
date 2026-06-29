import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parkingService } from "@/services/parkingService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  OPEN: { label: "ĐANG MỞ CỬA", className: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
  CLOSED: { label: "ĐÃ ĐÓNG CỬA", className: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
  MAINTENANCE: { label: "BẢO TRÌ", className: "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
};

function formatTime(isoString) {
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ParkingInfoPage() {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await parkingService.getParkingInfo();
        setInfo(data);
      } catch {
        setError("Không tải được thông tin bãi xe. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const statusCfg = STATUS_CONFIG[info?.status] || STATUS_CONFIG["CLOSED"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-14">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-8 bg-blue-600 rounded w-2/3" />
              <div className="h-4 bg-blue-600 rounded w-1/2" />
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-200 text-sm font-semibold mb-3">⚠ {error}</p>
              <Button
                onClick={() => { setIsLoading(true); setError(null); }}
                variant="secondary"
                className="bg-white text-blue-800 hover:bg-blue-50"
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-3xl font-black tracking-tight">{info.name}</h1>
                <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${statusCfg.className}`}>
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-blue-200 text-sm mb-1">📍 {info.address}</p>
              <p className="text-blue-200 text-sm mb-1">📞 {info.hotline}</p>
              <p className="text-blue-200 text-sm">⏰ Giờ mở cửa: {info.openingHours}</p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Stats Row */}
        {!isLoading && !error && info && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Tổng số tầng", value: info.totalFloors },
              { label: "Tổng số khu", value: info.totalAreas },
              { label: "Tổng số slot", value: info.totalSlots },
              { label: "Slot còn trống", value: info.availableSlots, highlight: true },
            ].map((stat) => (
              <Card
                key={stat.label}
                className={`rounded-xl border p-5 text-center shadow-sm flex flex-col justify-center items-center ${stat.highlight ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}
              >
                <p className={`text-3xl font-black ${stat.highlight ? "text-emerald-600" : "text-slate-800"}`}>{stat.value}</p>
                <CardDescription className="text-xs text-slate-500 mt-1 font-semibold">{stat.label}</CardDescription>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Truy cập nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Xem Slot Trống", desc: "Kiểm tra số chỗ còn trống theo tầng / loại xe", to: "/available-slots", icon: "🅿️", color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50" },
              { label: "Bảng Giá Gửi Xe", desc: "Giá gửi xe theo giờ, ngày và vé tháng", to: "/pricing", icon: "💰", color: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50" },
              { label: "Nội Quy Bãi Xe", desc: "Quy định vào ra, mất thẻ, sai biển số", to: "/rules", icon: "📋", color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50" },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-start gap-4"
              >
                <Card className={`flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm transition-all w-full h-full ${action.color}`}>
                  <span className="text-3xl select-none">{action.icon}</span>
                  <div>
                    <CardTitle className="font-bold text-slate-800 text-sm">{action.label}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">{action.desc}</CardDescription>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Support Note */}
        {!isLoading && !error && info && (
          <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-xs font-black text-slate-500 uppercase tracking-widest">Hỗ Trợ Khách Hàng</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-slate-700">{info.supportNote}</p>
              {info.lastUpdated && (
                <p className="text-xs text-slate-400 mt-3">Cập nhật lần cuối: {formatTime(info.lastUpdated)}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
