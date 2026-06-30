import React from "react";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { SLOT_STATUS } from "@/constants";

const SLOT_STATUS_DOT = {
  [SLOT_STATUS.AVAILABLE]: "bg-emerald-500",
  [SLOT_STATUS.OCCUPIED]: "bg-blue-600",
  [SLOT_STATUS.LOCKED]: "bg-red-500",
  [SLOT_STATUS.MAINTENANCE]: "bg-amber-500",
};

const STATUS_LABELS = {
  [SLOT_STATUS.AVAILABLE]: "AVAILABLE",
  [SLOT_STATUS.OCCUPIED]: "OCCUPIED",
  [SLOT_STATUS.LOCKED]: "LOCKED",
  [SLOT_STATUS.MAINTENANCE]: "MAINTENANCE",
};

export default function SlotDetailSidebar({ 
  selectedSlot, 
  setSelectedSlot, 
  targetStatus, 
  setTargetStatus, 
  statusReason, 
  setStatusReason, 
  handleUpdateSlotStatus 
}) {
  if (!selectedSlot) return null;

  return (
    <div className="w-80 flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col sticky top-6 self-start max-h-[calc(100vh-100px)]">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 text-sm">Chi tiết Slot {selectedSlot.code || selectedSlot.slotCode}</h3>
        <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-5">
        {/* Thông tin cơ bản */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Thông tin</h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
            <div className="text-slate-500 font-semibold">Tầng</div>
            <div className="font-bold text-slate-800 text-right">{selectedSlot.floorCode}</div>
            <div className="text-slate-500 font-semibold">Khu vực</div>
            <div className="font-bold text-slate-800 text-right">{selectedSlot.areaCode}</div>
            <div className="text-slate-500 font-semibold">Loại xe</div>
            <div className="font-bold text-slate-800 text-right">{selectedSlot.vehicleTypeName || "Không rõ"}</div>
          </div>
        </div>

        {/* Trạng thái hiện tại */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Trạng thái hiện tại</h4>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${SLOT_STATUS_DOT[selectedSlot.status] || "bg-slate-400"}`}></div>
            <span className="font-bold text-sm tracking-wide text-slate-700">{STATUS_LABELS[selectedSlot.status] || selectedSlot.status}</span>
          </div>
          
          {selectedSlot.status === SLOT_STATUS.OCCUPIED && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Slot đang được sử dụng bởi hệ thống Check-in. Không thể thay đổi trạng thái sang AVAILABLE thủ công.
              </p>
            </div>
          )}
        </div>

        {/* Cập nhật trạng thái */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Cập nhật trạng thái</h4>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500">Trạng thái mục tiêu</p>
            <div className="flex flex-col gap-3">
              {[SLOT_STATUS.AVAILABLE, SLOT_STATUS.LOCKED, SLOT_STATUS.MAINTENANCE].map(status => {
                const disabled = selectedSlot.status === SLOT_STATUS.OCCUPIED && status === SLOT_STATUS.AVAILABLE;
                return (
                  <label key={status} className={`flex items-center gap-2 text-xs font-bold ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input 
                      type="radio" 
                      name="targetStatus" 
                      value={status} 
                      checked={targetStatus === status}
                      onChange={() => setTargetStatus(status)}
                      disabled={disabled}
                      className={`w-3.5 h-3.5 accent-${status === SLOT_STATUS.AVAILABLE ? 'emerald-600' : status === SLOT_STATUS.LOCKED ? 'red-600' : 'amber-500'}`}
                    />
                    <span className={
                      status === SLOT_STATUS.AVAILABLE ? "text-emerald-700" :
                      status === SLOT_STATUS.LOCKED ? "text-red-700" : "text-amber-700"
                    }>{STATUS_LABELS[status]}</span>
                  </label>
                );
              })}
            </div>
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Lý do / Ghi chú (bắt buộc nếu khóa/bảo trì)</label>
              <textarea 
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs h-20 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" 
                placeholder="Nhập lý do..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 flex gap-2 bg-slate-50 rounded-b-xl">
        <Button variant="outline" className="flex-1 text-xs font-bold" onClick={() => setSelectedSlot(null)}>Hủy</Button>
        <Button 
          className="flex-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white" 
          onClick={handleUpdateSlotStatus}
          disabled={targetStatus === selectedSlot.status || (selectedSlot.status === SLOT_STATUS.OCCUPIED && targetStatus === SLOT_STATUS.AVAILABLE)}
        >
          Lưu cập nhật
        </Button>
      </div>
    </div>
  );
}
