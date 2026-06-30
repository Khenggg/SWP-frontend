import React, { useState } from "react";
import { X, Check, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
};

const PRIORITY_BADGE = {
  HIGH: "bg-red-100 text-red-600 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-600 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

export default function MismatchSidePanel({ 
  item, 
  onClose,
  onApprove,
  onReject,
  onRequestMoreInfo
}) {
  if (!item) return null;

  const [activeTab, setActiveTab] = useState("INFO");

  const caseCode = item.caseCode || `MM-${new Date(item.createdAt || new Date()).getFullYear()}-${(item.id || 0).toString().padStart(5, '0')}`;
  const priority = item.priority || "MEDIUM";
  const priorityLabel = priority === "HIGH" ? "Cao" : priority === "MEDIUM" ? "Trung bình" : "Thấp";
  const statusDisplay = item.status === "PENDING" ? "CHỜ PHÊ DUYỆT" : item.status === "CONFIRMED" ? "ĐÃ PHÊ DUYỆT" : "ĐÃ TỪ CHỐI";
  
  // Mock data for UI that is not directly in DB spec for plate_mismatch_cases
  const creatorRole = item.creatorRole || "STAFF";
  const sessionStatus = item.sessionStatus || "ACTIVE";
  
  const entryTime = item.entryTime ? formatDateTime(item.entryTime) : "01/06/2026 08:00:00";
  const exitTime = item.createdAt ? formatDateTime(item.createdAt) : formatDateTime(new Date());

  const cardGroup = item.cardGroup || "Thẻ tháng";
  const cardType = item.cardType || "Thẻ tháng ô tô";

  return (
    <div className="w-[500px] bg-slate-50/50 border-l border-slate-200 flex flex-col shadow-xl flex-shrink-0 animate-in slide-in-from-right-4 h-full">
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

                <span className="text-slate-500 text-sm">Mức độ ưu tiên</span>
                <div>
                  <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold border ${PRIORITY_BADGE[priority]}`}>
                    {priorityLabel}
                  </Badge>
                </div>

                <span className="text-slate-500 text-sm">Thời gian tạo</span>
                <span className="text-slate-800 font-medium">{item.createdAt ? formatDateTime(item.createdAt) : ''}</span>

                <span className="text-slate-500 text-sm">Người tạo (Staff)</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.reporterName || item.createdBy}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-slate-800 font-semibold">{item.reporterName || item.createdBy || "Staff"}</span>
                  <Badge variant="outline" className={`px-1.5 py-0 text-[9px] w-fit font-bold ${creatorRole === 'MANAGER' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
                    {creatorRole}
                  </Badge>
                </div>

                <span className="text-slate-500 text-sm">Kênh tạo</span>
                <span className="text-slate-800 font-medium">Hệ thống (Staff Portal)</span>
              </div>
            </div>

            {/* Thông tin phiên đỗ xe */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-800 border-b border-slate-200 pb-2">Thông tin phiên đỗ xe</h4>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 items-center">
                <span className="text-slate-500 text-sm">Mã phiên</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-800 font-medium">{item.sessionCode || "PS-000456"}</span>
                  <Button variant="link" className="h-auto p-0 text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-md hover:no-underline hover:bg-blue-100 font-bold">Xem chi tiết phiên</Button>
                </div>

                <span className="text-slate-500 text-sm">Vào bãi</span>
                <span className="text-slate-800 font-medium">{entryTime} - Gate 1</span>

                <span className="text-slate-500 text-sm">Ra bãi (đề nghị)</span>
                <span className="text-slate-800 font-medium">{exitTime} - Gate 1</span>

                <span className="text-slate-500 text-sm">Thời gian đỗ</span>
                <span className="text-slate-800 font-medium">2 giờ 13 phút</span>

                <span className="text-slate-500 text-sm">Loại khách</span>
                <span className="text-slate-800 font-medium">{cardGroup === 'Thẻ tháng' ? 'Thuê bao tháng' : 'Vãng lai'}</span>

                <span className="text-slate-500 text-sm">Trạng thái phiên</span>
                <div>
                  <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                    {sessionStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Thông tin thẻ và xe */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-800 border-b border-slate-200 pb-2">Thông tin thẻ và xe</h4>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 items-center">
                <span className="text-slate-500 text-sm">Mã thẻ</span>
                <span className="text-slate-800 font-medium">{item.cardCode || "CARD-UNKNOWN"}</span>

                <span className="text-slate-500 text-sm">Chủ thẻ</span>
                <span className="text-slate-800 font-medium">{item.cardOwner || "Nguyễn Văn A"}</span>

                <span className="text-slate-500 text-sm">Nhóm thẻ</span>
                <div>
                  <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold border border-purple-200 bg-purple-50 text-purple-700">
                    {cardGroup}
                  </Badge>
                </div>

                <span className="text-slate-500 text-sm">Loại thẻ</span>
                <span className="text-slate-800 font-medium">{cardType}</span>

                <span className="text-slate-500 text-sm">Biển số đăng ký trên thẻ</span>
                <span className="font-mono text-slate-800 font-bold">{item.entryPlateNumber || "N/A"}</span>
              </div>
            </div>

            {/* Thông tin lệch biển số */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-800 border-b border-slate-200 pb-2">Thông tin lệch biển số</h4>
              <div className="grid grid-cols-[140px_1fr] gap-y-3">
                <span className="text-slate-500 text-sm">Biển số thực tế <br/>(camera/nhập tay)</span>
                <span className="font-mono font-bold text-red-600">{item.exitPlateNumber || "N/A"}</span>

                <span className="text-slate-500 text-sm">Loại lệch</span>
                <span className="text-slate-800 font-medium">Khác số</span>

                <span className="text-slate-500 text-sm">Lý do đề nghị</span>
                <span className="text-slate-800 font-semibold">{item.reason || "Đi nhầm xe của người thân"}</span>

                <span className="text-slate-500 text-sm">Ghi chú</span>
                <span className="text-slate-700 text-sm leading-relaxed">{item.note || "Xe màu đen, cùng người sử dụng."}</span>
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
            {onRequestMoreInfo && (
              <Button variant="outline" className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 h-11 font-semibold" onClick={() => onRequestMoreInfo(item)}>
                <HelpCircle className="w-5 h-5 mr-2" /> Yêu cầu bổ sung
              </Button>
            )}
            <Button variant="outline" className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 bg-emerald-50 h-11 font-semibold" onClick={() => onApprove(item)}>
              <Check className="w-5 h-5 mr-2" /> Phê duyệt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
