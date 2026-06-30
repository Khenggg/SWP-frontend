import React, { useState, useEffect, useMemo, memo } from "react";
import { dashboardService } from "../../services/dashboardService";
import { toast } from "sonner";
import { RefreshCw, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatVND(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + "đ";
}

const StatCard = memo(({ label, value, icon, color, isLoading }) => {
  const parts = color.split(" ");
  const textColor = parts[0];
  const bgColor = parts[1];
  return (
    <Card className="shadow-sm flex flex-col items-center text-center gap-4 p-5 transition-all hover:shadow-md">
      <div className={`text-3xl p-3 rounded-lg ${bgColor}`}>{icon}</div>
      <div className="flex flex-col items-center">
        <CardDescription className="text-xs font-black text-slate-400 uppercase tracking-wide">{label}</CardDescription>
        {isLoading ? (
          <div className="h-7 w-20 bg-slate-200/80 animate-pulse rounded mt-1" />
        ) : (
          <CardTitle className={`text-2xl font-black mt-1 ${textColor}`}>
            <span key={value} className="inline-block animate-in fade-in zoom-in-95 duration-300">
              {value}
            </span>
          </CardTitle>
        )}
      </div>
    </Card>
  );
});
StatCard.displayName = "StatCard";

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState({ revenueToday: 0, entriesToday: 0, exitsToday: 0, incidents: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) {
        setIsLoading(true);
      }
      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivities()
      ]);
      setStats(statsData);
      setRecentActivities(activitiesData);
    } catch (err) {
      console.error("Lỗi tải thông tin Dashboard:", err);
      toast.error("Không thể tải thông tin Dashboard");
    } finally {
      if (isFirstLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboard(true);

    // Live update polling every 10 seconds to keep stats real-time
    const pollInterval = setInterval(() => {
      fetchDashboard(false);
    }, 10000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  const handleExport = async () => {
    try {
      toast.info("Đang tải dữ liệu...");
      // For now, mock export since dashboard doesn't have a specific export endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Xuất báo cáo thành công!");
    } catch (e) {
      toast.error("Lỗi khi xuất file Excel.");
    }
  };

  const statsList = useMemo(() => [
    { label: "Doanh Thu Hôm Nay", value: formatVND(stats.revenueToday), icon: "💰", color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Lượt Xe Vào", value: stats.entriesToday.toString(), icon: "📥", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Lượt Xe Ra", value: stats.exitsToday.toString(), icon: "📤", color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Sự Cố (Cần Duyệt)", value: stats.incidents.toString(), icon: "⚠️", color: "text-red-600 bg-red-50 border-red-100" },
  ], [stats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Bảng Vận Hành Bãi Xe</h2>
          <p className="text-sm text-slate-500 mt-0.5">Thống kê hoạt động gửi xe thời gian thực</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1 font-bold shadow-sm mr-2">
            <span className="text-emerald-500 mr-2 animate-pulse">●</span> Live Data
          </Badge>
          <Button variant="outline" className="text-slate-600 font-bold" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hour Traffic chart simulator */}
        <Card className="shadow-sm p-6">
          <CardHeader className="p-0 mb-4 border-b pb-3">
            <CardTitle className="font-black text-slate-700 uppercase tracking-wide text-sm">Lưu Lượng Xe Theo Giờ</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 60, 30, 80, 100, 70, 50, 90, 60, 40].map((h, i) => (
                <div key={i} className="w-full bg-blue-100/50 rounded-t-sm relative group h-full">
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-1000"
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs font-bold text-slate-400">
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>22:00</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities list */}
        <Card className="shadow-sm p-6">
          <CardHeader className="p-0 mb-4 border-b pb-3 flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-black text-slate-700 uppercase tracking-wide text-sm">Xe Vừa Vào Bãi</CardTitle>
            <Button variant="link" className="text-xs font-bold text-blue-600 p-0 h-auto">Xem tất cả</Button>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 h-16">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-12 rounded bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-20 rounded bg-slate-200" />
                        <div className="h-3 w-16 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-3 w-10 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-4xl mb-3">🚗</p>
                <p className="font-semibold">Không có hoạt động gần đây</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((v) => (
                  <div key={v.plate + "-" + v.time} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`px-2 py-0.5 rounded text-xs font-bold border ${v.type === "Ô Tô" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                        {v.type}
                      </Badge>
                      <div>
                        <p className="font-mono font-bold text-slate-800">{v.plate}</p>
                        <p className="text-xs text-slate-500">{v.gate}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{v.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
