import React from "react";
import { CreditCard, XCircle, Calendar, RefreshCw, Tag, Hash, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CARD_STATUS } from "@/constants";

const CARD_STATUS_BADGE = {
  [CARD_STATUS.AVAILABLE]: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  [CARD_STATUS.IN_USE]: "bg-blue-100 text-blue-700 border border-blue-300",
  [CARD_STATUS.LOST]: "bg-red-100 text-red-700 border border-red-300",
  [CARD_STATUS.DAMAGED]: "bg-amber-100 text-amber-700 border border-amber-300",
  [CARD_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border border-slate-300",
};

const STATUS_LABELS = {
  [CARD_STATUS.AVAILABLE]: "Khả dụng",
  [CARD_STATUS.IN_USE]: "Đang sử dụng",
  [CARD_STATUS.LOST]: "Bị mất",
  [CARD_STATUS.DAMAGED]: "Bị hỏng",
  [CARD_STATUS.INACTIVE]: "Ngừng hoạt động",
};

export default function CardDetailSidebar({ 
  selectedCard, 
  setSelectedCard, 
  openStatusModal, 
  isLogsLoading, 
  auditLogs 
}) {
  if (!selectedCard) return null;

  return (
    <div className="w-full lg:w-[350px] flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full overflow-y-auto">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" /> Chi tiết thẻ
        </h3>
        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" onClick={() => setSelectedCard(null)}>
          <XCircle className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
      
      <div className="p-5 flex flex-col gap-6">
        {/* Header Info */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">{selectedCard.cardNumber || selectedCard.code}</h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={CARD_STATUS_BADGE[selectedCard.status]}>
                {STATUS_LABELS[selectedCard.status]}
              </Badge>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono truncate max-w-[150px]" title={selectedCard.qrToken}>
                {selectedCard.qrToken ? selectedCard.qrToken.substring(0, 16) + "..." : "Không có QR"}
              </span>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày tạo</span>
            <span className="font-medium text-gray-900">{selectedCard.createdAt ? new Date(selectedCard.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Cập nhật lần cuối</span>
            <span className="font-medium text-gray-900">{selectedCard.updatedAt ? new Date(selectedCard.updatedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Session hiện tại</span>
            <span className="font-medium text-blue-600">{selectedCard.currentSessionId || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 flex items-center gap-2"><Hash className="w-4 h-4" /> Ghi chú</span>
            <span className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-100 min-h-[40px]">
              {selectedCard.note || "Không có ghi chú"}
            </span>
          </div>
        </div>

        {/* QR Dummy */}
        <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
          <p className="text-xs text-gray-500 font-medium mb-3">QR code (Xem trước)</p>
          <div className="bg-white p-2 shadow-sm rounded-lg border border-gray-200">
            <div className="w-24 h-24 bg-gray-800" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)',
              backgroundPosition: '0 0, 4px 4px',
              backgroundSize: '8px 8px'
            }}></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => openStatusModal(selectedCard)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Đổi trạng thái
          </Button>
        </div>

        {/* Recent Activities */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900">Hoạt động gần đây (F054)</h4>
          </div>
          {isLogsLoading ? (
            <div className="text-center text-xs text-gray-500 py-4">Đang tải...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-4 bg-gray-50 rounded-lg border border-gray-100">Chưa có hoạt động nào</div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {auditLogs.map((log) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-blue-50 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-xs">{log.action}</div>
                      <time className="font-mono text-[10px] text-blue-600">{new Date(log.timestamp).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time>
                    </div>
                    <div className="text-[11px] text-slate-500">{log.details} • {log.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
