import React from "react";
import { CreditCard, CheckCircle2, PlayCircle, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";

export default function CardStatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard 
        icon={<CreditCard className="text-blue-500" />} 
        title="Tổng số thẻ" 
        value={stats.total} 
        bg="bg-blue-50" 
        subtitle="Tất cả" 
      />
      <StatCard 
        icon={<CheckCircle2 className="text-emerald-500" />} 
        title="Thẻ khả dụng" 
        value={stats.available} 
        bg="bg-emerald-50" 
        subtitle={stats.total ? ((stats.available / stats.total) * 100).toFixed(1) + "%" : "0%"} 
      />
      <StatCard 
        icon={<PlayCircle className="text-blue-600" />} 
        title="Thẻ đang sử dụng" 
        value={stats.inUse} 
        bg="bg-blue-50" 
        subtitle={stats.total ? ((stats.inUse / stats.total) * 100).toFixed(1) + "%" : "0%"} 
      />
      <StatCard 
        icon={<XCircle className="text-red-500" />} 
        title="Thẻ bị mất" 
        value={stats.lost} 
        bg="bg-red-50" 
        subtitle={stats.total ? ((stats.lost / stats.total) * 100).toFixed(1) + "%" : "0%"} 
      />
      <StatCard 
        icon={<AlertTriangle className="text-amber-500" />} 
        title="Thẻ hỏng" 
        value={stats.damaged} 
        bg="bg-amber-50" 
        subtitle={stats.total ? ((stats.damaged / stats.total) * 100).toFixed(1) + "%" : "0%"} 
      />
      <StatCard 
        icon={<ShieldAlert className="text-slate-500" />} 
        title="Thẻ ngừng HĐ" 
        value={stats.inactive} 
        bg="bg-slate-50" 
        subtitle={stats.total ? ((stats.inactive / stats.total) * 100).toFixed(1) + "%" : "0%"} 
      />
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, bg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-2 transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500">{title}</span>
          <span className="text-xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1 pl-1 font-medium">{subtitle}</div>
    </div>
  );
}
