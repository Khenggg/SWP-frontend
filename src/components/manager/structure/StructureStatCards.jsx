import React from "react";
import { Layers, Map, Grid, CheckCircle, Car, Wrench } from "lucide-react";

export default function StructureStatCards({ 
  floorsCount, 
  areasCount, 
  totalSlots, 
  availableSlots, 
  occupiedSlots, 
  maintenanceSlots, 
  percentAvailable, 
  percentOccupied, 
  percentMaintenance 
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Tầng */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tầng</p>
          <p className="text-2xl font-bold text-slate-800">{floorsCount}</p>
          <p className="text-xs text-slate-400 mt-1">Tầng</p>
        </div>
      </div>
      {/* Khu vực */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <Map className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng khu vực</p>
          <p className="text-2xl font-bold text-slate-800">{areasCount}</p>
          <p className="text-xs text-slate-400 mt-1">Khu vực</p>
        </div>
      </div>
      {/* Slot */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
          <Grid className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng slot</p>
          <p className="text-2xl font-bold text-slate-800">{totalSlots}</p>
          <p className="text-xs text-slate-400 mt-1">Slot</p>
        </div>
      </div>
      {/* Trống */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slot trống</p>
          <p className="text-2xl font-bold text-slate-800">{availableSlots}</p>
          <p className="text-xs text-slate-400 mt-1">{percentAvailable}%</p>
        </div>
      </div>
      {/* Đang dùng */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          <Car className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slot đang dùng</p>
          <p className="text-2xl font-bold text-slate-800">{occupiedSlots}</p>
          <p className="text-xs text-slate-400 mt-1">{percentOccupied}%</p>
        </div>
      </div>
      {/* Bảo trì */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bảo trì/Khóa</p>
          <p className="text-2xl font-bold text-slate-800">{maintenanceSlots}</p>
          <p className="text-xs text-slate-400 mt-1">{percentMaintenance}%</p>
        </div>
      </div>
    </div>
  );
}
