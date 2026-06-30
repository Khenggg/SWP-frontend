import React from "react";
import { X, ClipboardList } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const JsonDisplay = ({ data, mode }) => {
  if (!data) return null;
  // Admin có thể xem được JSON có format đẹp hơn
  const str = typeof data === 'string' ? data : JSON.stringify(data, null, mode === 'admin' ? 2 : 0);
  return (
    <pre className={`overflow-auto bg-slate-900 p-3 rounded-lg border border-slate-700 font-mono whitespace-pre text-emerald-400 ${mode === 'admin' ? 'text-xs max-h-[300px]' : 'text-[10px] max-h-40'}`}>
      {str}
    </pre>
  );
};

export default function AuditLogSidePanel({ log, onClose, mode }) {
  if (!log) return null;

  return (
    <div className="w-[400px] bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm flex-shrink-0 animate-in slide-in-from-right-4 h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="font-bold text-lg text-slate-800">Chi tiết nhật ký</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto space-y-6 text-sm">
        {/* Top Info Card */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs flex-1">
            <div className="flex justify-between">
              <span className="text-slate-500">ID nhật ký</span>
              <span className="font-mono font-medium text-slate-700">#{log.id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian</span>
              <span className="font-medium text-slate-700">{formatDateTime(log.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nguồn</span>
              <span className="font-medium text-slate-700">{log.sourceService || "CORE_API"}</span>
            </div>
          </div>
        </div>

        {/* General Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">Thông tin chung</h4>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-xs">Người thực hiện</span>
              <span className="font-medium text-slate-900">{log.actorUserId || "Hệ thống"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-xs">Hành động</span>
              <span className="font-bold text-slate-900 text-xs">{log.action}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-xs">Đối tượng</span>
              <span className="font-medium text-slate-900">{log.targetType}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-xs">ID đối tượng</span>
              <span className="font-mono text-slate-900">{log.targetId}</span>
            </div>
          </div>
          
          {log.reason && (
            <div className="flex flex-col gap-1 pt-2">
              <span className="text-slate-500 text-xs">Lý do / Mô tả</span>
              <span className="text-slate-900 bg-slate-50 p-2 rounded text-sm">{log.reason}</span>
            </div>
          )}
        </div>

        {/* Changes Data */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">Dữ liệu thay đổi</h4>
          
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-medium">Dữ liệu cũ (Old Values)</span>
            {log.oldValue ? (
              <JsonDisplay data={log.oldValue} mode={mode} />
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-400 text-xs italic text-center">
                (Không có)
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-medium">Dữ liệu mới (New Values)</span>
            {log.newValue ? (
              <JsonDisplay data={log.newValue} mode={mode} />
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-400 text-xs italic text-center">
                (Không có)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
        <Button variant="outline" className="bg-white" onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
}
