import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit3, Copy, Ban } from "lucide-react";
import { COMMON_STATUS } from "@/constants";

const STATUS_BADGE = {
  [COMMON_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [COMMON_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border-slate-200",
  "SCHEDULED": "bg-orange-100 text-orange-700 border-orange-200",
  "EXPIRED": "bg-gray-100 text-gray-500 border-gray-200"
};

function formatVND(amount) { return Number(amount).toLocaleString("vi-VN") + "đ"; }
function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
}

export default function PricingRuleSidebar({
  selectedRule,
  setSelectedRule,
  openEdit,
  openDuplicate,
  handleStopRule
}) {
  if (!selectedRule) return null;

  return (
    <div className="w-[360px] bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm flex-shrink-0 animate-in slide-in-from-right-4">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="font-bold text-lg text-slate-800">Chi tiết rule giá</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedRule(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">ID Rule</span>
            <span className="font-semibold text-slate-900">#{selectedRule.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Loại xe</span>
            <span className="font-semibold text-slate-900 flex items-center gap-2">
               {selectedRule.vehicleType?.name || selectedRule.vehicleTypeName}
            </span>
          </div>
          <div className="w-full h-px bg-slate-100 my-2" />
          <div className="flex justify-between">
            <span className="text-slate-500">Giá ngày (06:00 - 22:00)</span>
            <span className="font-semibold text-slate-900">{formatVND(selectedRule.dayPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Giá đêm (22:00 - 06:00)</span>
            <span className="font-semibold text-slate-900">{formatVND(selectedRule.nightPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Giá vé tháng</span>
            <span className="font-semibold text-slate-900">{formatVND(selectedRule.monthlyPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phí mất thẻ</span>
            <span className="font-semibold text-slate-900">{formatVND(selectedRule.lostCardFee)}</span>
          </div>
          <div className="w-full h-px bg-slate-100 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Hiệu lực từ</span>
            <span className="font-semibold text-slate-900">{formatDate(selectedRule.effectiveFrom)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Trạng thái</span>
            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${STATUS_BADGE[selectedRule.status] || STATUS_BADGE.ACTIVE}`}>
              {selectedRule.status}
            </Badge>
          </div>
          <div className="w-full h-px bg-slate-100 my-2" />
          <div className="flex justify-between">
            <span className="text-slate-500">Ngày tạo</span>
            <div className="font-semibold text-slate-900">{formatDate(selectedRule.createdAt)}</div>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cập nhật lần cuối</span>
            <div className="font-semibold text-slate-900">{formatDate(selectedRule.updatedAt)}</div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-center" onClick={() => openEdit(selectedRule)}>
          <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa
        </Button>
        <Button variant="outline" className="w-full justify-center bg-white" onClick={() => openDuplicate(selectedRule)}>
          <Copy className="w-4 h-4 mr-2" /> Nhân bản rule
        </Button>
        <Button variant="outline" className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-white" onClick={() => handleStopRule(selectedRule)}>
          <Ban className="w-4 h-4 mr-2" /> Ngưng áp dụng
        </Button>
      </div>
    </div>
  );
}
