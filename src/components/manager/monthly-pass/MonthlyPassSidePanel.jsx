import React from "react";
import { X, CheckCircle, AlertCircle, Edit, RefreshCw, RefreshCcw, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { PASS_STATUS } from "@/constants";

const STATUS_BADGE = {
  [PASS_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-300",
  [PASS_STATUS.EXPIRED]: "bg-slate-100 text-slate-500 border-slate-300",
  [PASS_STATUS.LOCKED]: "bg-red-100 text-red-700 border-red-300",
  [PASS_STATUS.CANCELLED]: "bg-amber-100 text-amber-700 border-amber-300",
};

const calculateRemainingDays = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  return days;
};

export default function MonthlyPassSidePanel({ 
  pass, 
  onClose,
  onEdit,
  onRenew,
  onStatusChange,
  onLockToggle
}) {
  if (!pass) return null;

  const remainingDays = calculateRemainingDays(pass.endDate);
  const isExpiringSoon = pass.status === PASS_STATUS.ACTIVE && remainingDays <= 7 && remainingDays >= 0;
  
  let remainingDisplay = `${remainingDays} ngày`;
  let remainingClass = "text-slate-700 font-medium";
  
  if (remainingDays < 0) {
    remainingDisplay = `${remainingDays} ngày`;
    remainingClass = "text-red-500 font-bold";
  } else if (isExpiringSoon) {
    remainingClass = "text-amber-500 font-bold";
  }

  let statusDisplay = pass.status;
  let badgeClass = STATUS_BADGE[pass.status] || "bg-slate-100 text-slate-500 border-slate-300";
  let isValidForEntry = false;
  
  if (pass.status === PASS_STATUS.ACTIVE && remainingDays >= 0) {
    isValidForEntry = true;
  }
  
  if (pass.status === PASS_STATUS.ACTIVE && remainingDays < 0) {
     statusDisplay = PASS_STATUS.EXPIRED;
     badgeClass = STATUS_BADGE[PASS_STATUS.EXPIRED];
  } else if (isExpiringSoon) {
     statusDisplay = "EXPIRING_SOON";
     badgeClass = "bg-amber-100 text-amber-700 border-amber-300";
  }

  const passCode = `MP-${new Date(pass.createdAt || new Date()).getFullYear()}-${(pass.id || "").toString().padStart(3, "0")}`;

  return (
    <div className="w-[380px] bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm flex-shrink-0 animate-in slide-in-from-right-4 h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-lg text-slate-800">Chi tiết vé tháng</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-200" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto space-y-6 text-sm">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Mã vé</span>
            <span className="font-mono font-bold text-slate-800">{passCode}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Trạng thái</span>
            <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold border uppercase ${badgeClass}`}>
              {statusDisplay}
            </Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Chủ xe</span>
            <span className="font-semibold text-slate-800">{pass.ownerName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">SĐT</span>
            <span className="font-medium text-slate-800">{pass.phone || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Biển số</span>
            <span className="font-bold text-slate-800 text-base">{pass.plate || pass.plateNumber}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Loại xe</span>
            <span className="font-medium text-slate-800">{pass.vehicleTypeName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Ngày bắt đầu</span>
            <span className="font-medium text-slate-800">{pass.startDate}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Ngày hết hạn</span>
            <span className="font-bold text-slate-800">{pass.endDate}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Còn lại</span>
            <span className={`font-bold ${remainingClass}`}>{remainingDisplay}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-xs font-semibold uppercase">Người tạo</span>
            <span className="font-medium text-slate-800">{pass.createdBy || "Hệ thống"}</span>
          </div>
          <div className="flex flex-col gap-1 py-2">
            <span className="text-slate-500 text-xs font-semibold uppercase">Ghi chú</span>
            <span className="text-slate-600 italic text-xs bg-slate-50 p-2 rounded border border-slate-100">
              Không có ghi chú
            </span>
          </div>
        </div>

        {/* Validity Check */}
        <div className={`p-4 rounded-lg border flex flex-col gap-1 ${isValidForEntry ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-2">
            {isValidForEntry ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <span className={`font-bold text-sm ${isValidForEntry ? 'text-emerald-700' : 'text-red-700'}`}>
              {isValidForEntry ? 'Vé tháng hợp lệ cho entry/exit' : 'Vé tháng không hợp lệ hoặc đã hết hạn'}
            </span>
          </div>
          <span className="text-xs text-slate-500 ml-7">
            Cập nhật lúc {formatDateTime(pass.updatedAt || new Date())}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onEdit(pass)}>
            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
          </Button>
          <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => onRenew(pass)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Gia hạn
          </Button>
          <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => onStatusChange(pass)}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Đổi trạng thái
          </Button>
          <Button variant="outline" className={`w-full ${pass.status === PASS_STATUS.LOCKED ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' : 'text-red-600 border-red-200 hover:bg-red-50'}`} onClick={() => onLockToggle(pass)}>
            {pass.status === PASS_STATUS.LOCKED ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />} 
            {pass.status === PASS_STATUS.LOCKED ? 'Mở khóa vé' : 'Khóa vé'}
          </Button>
        </div>
      </div>
    </div>
  );
}
