import React, { useState } from "react";
import { X, Check, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
};

const PRIORITY_BADGE = {
  HIGH: "bg-red-100 text-red-600 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-600 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

export default function LostCardSidePanel({ 
  item, 
  onClose,
  onApprove,
  onReject
}) {
  if (!item) return null;

  const [activeTab, setActiveTab] = useState("INFO");

  const caseCode = item.caseCode || `LC-${new Date(item.createdAt || new Date()).getFullYear()}-${(item.id || 0).toString().padStart(5, '0')}`;
  const priority = item.priority || "MEDIUM";
  const priorityLabel = priority === "HIGH" ? "Cao" : priority === "MEDIUM" ? "Trung bình" : "Thấp";
  const statusDisplay = item.status === "PENDING" ? "CHỜ PHÊ DUYỆT" : item.status === "APPROVED" ? "ĐÃ PHÊ DUYỆT" : "ĐÃ TỪ CHỐI";
  
  // Mocking some card/vehicle info since it's not all in the lost_card_cases response directly
  const cardType = item.cardType || "VÃNG LAI";
  const vehicleType = item.vehicleType || "Ô tô";
  const creatorRole = item.creatorRole || "STAFF";

  return (
    <div className="w-[450px] bg-slate-50/50 border-l border-slate-200 flex flex-col shadow-xl flex-shrink-0 animate-in slide-in-from-right-4 h-full">
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h3 className="font-bold text-lg text-slate-800">Chi tiết yêu cầu #{caseCode}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 px-6 bg-white">
        {[
          { id: "INFO", label: "Thông tin yêu cầu" },
          { id: "HISTORY", label: "Lịch sử xử lý" },
          { id: "ATTACHMENTS", label: "Tệp đính kèm (2)" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 text-sm font-semibold relative transition-colors ${
              activeTab === tab.id 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto space-y-8 text-sm">
        {activeTab === "INFO" ? (
          <>
            {/* Thông tin chung */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-800 border-b border-slate-200 pb-2">Thông tin chung</h4>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 items-center">
                <span className="text-slate-500 text-sm">Mã yêu cầu</span>
                <span className="font-mono text-slate-800 font-medium">{caseCode}</span>

                <span className="text-slate-500 text-sm">Trạng thái</span>
                <div>
                  <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold border uppercase ${STATUS_BADGE[item.status]}`}>
                    {statusDisplay}
                  </Badge>
                </div>

                <span className="text-slate-500 text-sm">Thời gian tạo</span>
                <span className="text-slate-800 font-medium">{item.createdAt ? formatDateTime(item.createdAt) : ''}</span>

                <span className="text-slate-500 text-sm">Người tạo (Staff)</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.reporterName}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-slate-800 font-semibold">{item.reporterName || "Staff"}</span>
                  <Badge variant="outline" className={`px-1.5 py-0 text-[9px] w-fit font-bold ${creatorRole === 'MANAGER' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
                    {creatorRole}
                  </Badge>
                </div>

                <span className="text-slate-500 text-sm">Kênh tạo</span>
                <span className="text-slate-800 font-medium">Hệ thống (Staff Portal)</span>

                <span className="text-slate-500 text-sm">Mức độ ưu tiên</span>
                <div>
                  <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold border ${PRIORITY_BADGE[priority]}`}>
                    {priorityLabel}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Thông tin thẻ bị mất */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-800 border-b border-slate-200 pb-2">Thông tin thẻ bị mất</h4>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 items-center">
                <span className="text-slate-500 text-sm">Mã thẻ</span>
                <span className="text-slate-800 font-medium">{item.cardCode || "CARD-UNKNOWN"}</span>

                <span className="text-slate-500 text-sm">Chủ thẻ</span>
                <span className="text-slate-800 font-medium">{item.cardOwner || "Khách vãng lai"}</span>

                <span className="text-slate-500 text-sm">Loại thẻ</span>
                <div>
                  <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold border border-purple-200 bg-purple-50 text-purple-700">
                    {cardType}
                  </Badge>
                </div>

                <span className="text-slate-500 text-sm">Ngày phát hành</span>
                <span className="text-slate-800 font-medium">01/06/2024</span>

                <span className="text-slate-500 text-sm">Trạng thái thẻ hiện tại</span>
                <div>
                  <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                    AVAILABLE
                  </Badge>
                </div>
              </div>
            </div>

            {/* Thông tin phương tiện */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-800 border-b border-slate-200 pb-2">Thông tin phương tiện</h4>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 items-center">
                <span className="text-slate-500 text-sm">Biển số</span>
                <span className="font-mono text-slate-800 font-medium">{item.plateNumber || "N/A"}</span>

                <span className="text-slate-500 text-sm">Loại xe</span>
                <span className="text-slate-800 font-medium">{vehicleType}</span>

                <span className="text-slate-500 text-sm">Màu xe</span>
                <span className="text-slate-800 font-medium">Đen</span>
              </div>
            </div>

            {/* Lý do và mô tả */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-800 border-b border-slate-200 pb-2">Lý do và mô tả</h4>
              <div className="grid grid-cols-[140px_1fr] gap-y-3">
                <span className="text-slate-500 text-sm">Lý do mất thẻ</span>
                <span className="text-slate-800 font-semibold">{item.reason || "Thất lạc"}</span>

                <span className="text-slate-500 text-sm">Mô tả chi tiết</span>
                <span className="text-slate-700 text-sm leading-relaxed">{item.verificationNote || "Khách hàng báo bị thất lạc thẻ khi đi công tác, không tìm thấy trong ví."}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-40 text-slate-400 italic">
            Chức năng đang được phát triển...
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        {item.status === "PENDING" && (
          <div className="flex items-center gap-3 w-full">
            <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-11 font-semibold" onClick={() => onReject(item)}>
              <XCircle className="w-5 h-5 mr-2" /> Từ chối
            </Button>
            <Button variant="outline" className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 h-11 font-semibold" onClick={() => onApprove(item)}>
              <CheckCircle2 className="w-5 h-5 mr-2" /> Phê duyệt & khóa thẻ
            </Button>
          </div>
        )}
        <p className="text-[11px] text-slate-500">
          * Khi phê duyệt, hệ thống sẽ khóa thẻ hiện tại và yêu cầu cấp thẻ mới.
        </p>
      </div>
    </div>
  );
}
