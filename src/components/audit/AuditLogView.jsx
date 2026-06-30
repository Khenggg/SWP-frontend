import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";
import { Button } from "@/components/ui/button";
import AuditLogFilters from "./AuditLogFilters";
import AuditLogTable from "./AuditLogTable";
import AuditLogSidePanel from "./AuditLogSidePanel";

export default function AuditLogView({ mode = "manager" }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters state
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterTarget, setFilterTarget] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterService, setFilterService] = useState("ALL");

  const [selectedLog, setSelectedLog] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterKeyword) params.keyword = filterKeyword;
      if (filterAction !== "ALL") params.action = filterAction;
      if (filterTarget !== "ALL") params.targetType = filterTarget;
      if (filterDate) params.date = filterDate;
      if (mode === "admin" && filterRole !== "ALL") params.role = filterRole;
      if (mode === "admin" && filterService !== "ALL") params.sourceService = filterService;
      
      const data = await auditService.getAuditLogs(params);
      setLogs(data || []);
    } catch (error) {
      toast.error(error.message || "Không tải được dữ liệu nhật ký.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = () => {
    setFilterKeyword("");
    setFilterAction("ALL");
    setFilterTarget("ALL");
    setFilterDate("");
    setFilterRole("ALL");
    setFilterService("ALL");
    loadData();
  };

  const handleExport = async () => {
    try {
      toast.info("Đang xuất file Excel...");
      const params = {};
      if (filterKeyword) params.keyword = filterKeyword;
      if (filterAction !== "ALL") params.action = filterAction;
      if (filterTarget !== "ALL") params.targetType = filterTarget;
      if (filterDate) params.date = filterDate;
      if (mode === "admin" && filterRole !== "ALL") params.role = filterRole;
      if (mode === "admin" && filterService !== "ALL") params.sourceService = filterService;

      const blob = await auditService.exportAuditLogs(params);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AuditLog_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Xuất Excel thành công!");
    } catch (error) {
      toast.error("Xuất Excel thất bại: " + error.message);
    }
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-col flex-1 gap-4 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Nhật ký hệ thống (Audit Logs) {mode === "admin" && "- Admin"}</h2>
            <p className="text-sm text-slate-500 mt-1">Tìm kiếm và xem lịch sử hoạt động của hệ thống</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="bg-white text-slate-700">
              <Download className="w-4 h-4 mr-2 text-slate-500" /> Xuất Excel
            </Button>
          </div>
        </div>

        <AuditLogFilters 
          filterKeyword={filterKeyword} setFilterKeyword={setFilterKeyword}
          filterAction={filterAction} setFilterAction={setFilterAction}
          filterTarget={filterTarget} setFilterTarget={setFilterTarget}
          filterDate={filterDate} setFilterDate={setFilterDate}
          filterRole={filterRole} setFilterRole={setFilterRole}
          filterService={filterService} setFilterService={setFilterService}
          mode={mode}
          onApply={loadData}
          onReset={handleReset}
          isLoading={isLoading}
        />

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
          <div className="p-3 border-b border-slate-200 flex items-center text-sm text-slate-500 bg-white font-semibold">
            Danh sách nhật ký ({logs.length} kết quả)
          </div>
          
          <AuditLogTable 
            logs={logs} 
            isLoading={isLoading} 
            selectedLogId={selectedLog?.id}
            onRowClick={setSelectedLog} 
          />
          
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-white">
            <div>Hiển thị {logs.length > 0 ? 1 : 0} - {logs.length} trong tổng số {logs.length} kết quả</div>
          </div>
        </div>
      </div>

      {selectedLog && (
        <AuditLogSidePanel 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
          mode={mode}
        />
      )}
    </div>
  );
}
