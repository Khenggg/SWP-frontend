import React from "react";
import { formatVND } from "@/lib/format";
import { 
  ArrowUpRight, ArrowDownRight, CarFront, 
  ArrowRight, ShieldAlert, PieChartIcon, Wallet 
} from "lucide-react";

export default function ReportStatCards({ summary, lostCardsPending }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard 
        title="Doanh thu (VNĐ)" 
        value={formatVND(summary?.revenueToday || 0)} 
        icon={<Wallet className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50"
      />
      <StatCard 
        title="Lượt xe vào" 
        value={summary?.entriesToday || 0} 
        icon={<CarFront className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50"
      />
      <StatCard 
        title="Lượt xe ra" 
        value={summary?.exitsToday || 0} 
        icon={<ArrowRight className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50"
      />
      <StatCard 
        title="Đang gửi (hiện tại)" 
        value={summary?.activeSessions || 0} 
        icon={<span className="font-bold text-orange-500">P</span>} iconBg="bg-orange-50"
      />
      <StatCard 
        title="Thẻ bị mất (mới)" 
        value={lostCardsPending || 0} 
        icon={<ShieldAlert className="w-5 h-5 text-red-600" />} iconBg="bg-red-50"
      />
      <StatCard 
        title="Tỷ lệ lấp đầy TB" 
        value={`${summary?.occupancyRate || 0}%`} 
        icon={<PieChartIcon className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50"
      />
    </div>
  );
}

function StatCard({ title, value, icon, iconBg }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
}
