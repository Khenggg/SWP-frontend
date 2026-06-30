import React from "react";
import { AlertTriangle, FileWarning, ShieldAlert, Wrench, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions({ stats, lostCardsPending, mismatchesPending, percentAvailable, maintenanceSlots }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Cảnh báo & xử lý nhanh</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Hết slot */}
        <div 
          className="bg-red-50/50 border border-red-200 rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-red-50 hover:shadow-sm transition-all group"
          onClick={() => navigate("/manager/structures")}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-red-100 flex items-center justify-center text-red-500 flex-shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center w-full">
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide">Cảnh báo hết slot</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">Hệ thống chỉ còn <span className="text-red-600">{percentAvailable}%</span> slot trống</p>
            <div className="flex items-center text-[11px] text-red-600 font-bold mt-2 hover:underline w-full">
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>

        {/* Card 2: Mất thẻ */}
        <div 
          className="bg-orange-50/50 border border-orange-200 rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-orange-50 hover:shadow-sm transition-all group"
          onClick={() => navigate("/manager/lost-card-approvals")}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <FileWarning className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center w-full">
            <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wide">{lostCardsPending} HỒ SƠ</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">Mất thẻ đang chờ duyệt</p>
            <div className="flex items-center text-[11px] text-orange-600 font-bold mt-2 hover:underline w-full">
              Xem & duyệt <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>

        {/* Card 3: Sai biển số */}
        <div 
          className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-amber-50 hover:shadow-sm transition-all group"
          onClick={() => navigate("/manager/mismatch-approvals")}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-amber-100 flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center w-full">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">{mismatchesPending} CA</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">Sai biển số cần xác minh</p>
            <div className="flex items-center text-[11px] text-amber-600 font-bold mt-2 hover:underline w-full">
              Xem & xử lý <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>

        {/* Card 4: Đang bảo trì */}
        <div 
          className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-blue-50 hover:shadow-sm transition-all group"
          onClick={() => navigate("/manager/structures")}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center w-full">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">{maintenanceSlots} SLOT</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">Đang bảo trì / khóa</p>
            <div className="flex items-center text-[11px] text-blue-600 font-bold mt-2 hover:underline w-full">
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
