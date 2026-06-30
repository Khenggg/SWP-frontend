import React from "react";
import { Car, CheckCircle, LogIn, LogOut, Wallet } from "lucide-react";
import { formatVND } from "@/lib/format";

export default function StatCards({ stats, availableSlots, occupiedSlots }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {/* Card 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0"><Car className="w-5 h-5" /></div>
        <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Xe đang gửi</p><p className="text-xl font-bold text-slate-800">{occupiedSlots}</p><p className="text-[10px] text-slate-400">Xe</p></div>
      </div>
      {/* Card 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><CheckCircle className="w-5 h-5" /></div>
        <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Slot trống</p><p className="text-xl font-bold text-slate-800">{availableSlots}</p><p className="text-[10px] text-slate-400">Slot</p></div>
      </div>

      {/* Card 4 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0"><LogIn className="w-5 h-5" /></div>
        <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Vào hôm nay</p><p className="text-xl font-bold text-slate-800">{stats.entriesToday}</p><p className="text-[10px] text-slate-400">Lượt</p></div>
      </div>
      {/* Card 5 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0"><LogOut className="w-5 h-5" /></div>
        <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ra hôm nay</p><p className="text-xl font-bold text-slate-800">{stats.exitsToday}</p><p className="text-[10px] text-slate-400">Lượt</p></div>
      </div>
      {/* Card 6 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm overflow-hidden">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Wallet className="w-5 h-5" /></div>
        <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Doanh thu nay</p><p className="text-sm font-bold text-slate-800 truncate">{formatVND(stats.revenueToday)}</p><p className="text-[10px] text-slate-400">VNĐ</p></div>
      </div>
    </div>
  );
}
