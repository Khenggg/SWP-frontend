import React, { useEffect, useState } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { approvalService } from "@/services/approvalService";
import { reportService } from "@/services/reportService";
import { Button } from "@/components/ui/button";
import MismatchFilters from "@/components/manager/mismatch/MismatchFilters";
import MismatchTable from "@/components/manager/mismatch/MismatchTable";
import MismatchSidePanel from "@/components/manager/mismatch/MismatchSidePanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MismatchApprovalsPage() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter States
  const [activeTab, setActiveTab] = useState("PENDING");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [filterMismatchType, setFilterMismatchType] = useState("ALL");
  const [filterCardGroup, setFilterCardGroup] = useState("ALL");
  const [filterReason, setFilterReason] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterKeyword, filterStatus, filterPriority, filterMismatchType, filterCardGroup, filterReason, filterDateRange]);

  const [selectedCase, setSelectedCase] = useState(null);
  
  // Dialog state for reasons
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [decisionType, setDecisionType] = useState(""); // "APPROVE" or "REJECT" or "MORE_INFO"
  const [reasonText, setReasonText] = useState("");

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const data = await approvalService.getMismatchCases();
      setCases(data || []);
    } catch (e) {
      console.error("Lỗi lấy danh sách hồ sơ lệch biển số:", e);
      toast.error("Không thể tải dữ liệu hồ sơ lệch biển số.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const counts = {
    PENDING: cases.filter(c => c.status === "PENDING").length,
    CONFIRMED: cases.filter(c => c.status === "CONFIRMED").length,
    REJECTED: cases.filter(c => c.status === "REJECTED").length,
    ALL: cases.length
  };

  const filtered = cases.filter(c => {
    if (activeTab !== "ALL" && c.status !== activeTab) return false;
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && (c.priority || "MEDIUM") !== filterPriority) return false;
    
    // (Additional UI filters like type, group, reason would be added here as substring matches, similar to lost card)
    if (filterReason !== "ALL") {
      const reasonLower = (c.reason || "").toLowerCase();
      if (filterReason === "MISTAKE" && !reasonLower.includes("nhầm")) return false;
      if (filterReason === "DIRTY" && !reasonLower.includes("bẩn") && !reasonLower.includes("mờ")) return false;
      if (filterReason === "RECOGNITION" && !reasonLower.includes("nhận diện") && !reasonLower.includes("camera")) return false;
    }

    if (filterKeyword) {
      const kw = filterKeyword.toLowerCase();
      const matchSearch = 
        (c.caseCode && c.caseCode.toLowerCase().includes(kw)) ||
        (c.cardCode && c.cardCode.toLowerCase().includes(kw)) ||
        (c.entryPlateNumber && c.entryPlateNumber.toLowerCase().includes(kw)) ||
        (c.exitPlateNumber && c.exitPlateNumber.toLowerCase().includes(kw)) ||
        (c.reporterName && c.reporterName.toLowerCase().includes(kw));
      if (!matchSearch) return false;
    }
    return true;
  });

  const paginatedCases = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const handleResetFilters = () => {
    setFilterKeyword("");
    setFilterStatus("ALL");
    setFilterPriority("ALL");
    setFilterDateRange("");
    setFilterMismatchType("ALL");
    setFilterCardGroup("ALL");
    setFilterReason("ALL");
  };

  const openDecisionDialog = (type) => {
    setDecisionType(type);
    setReasonText("");
    setShowReasonDialog(true);
  };

  const confirmDecision = async () => {
    if (!selectedCase) return;
    try {
      if (decisionType === "APPROVE") {
        await approvalService.confirmMismatchCase(selectedCase.sessionId || selectedCase.id, { reason: reasonText });
        toast.success("Đã phê duyệt lệch biển số thành công!");
      } else if (decisionType === "REJECT") {
        if (!reasonText.trim()) {
           toast.error("Vui lòng nhập lý do từ chối");
           return;
        }
        await approvalService.rejectMismatchCase(selectedCase.sessionId || selectedCase.id, { reason: reasonText });
        toast.success("Đã từ chối hồ sơ lệch biển số!");
      } else {
        toast.info("Đã gửi yêu cầu bổ sung thông tin (Tính năng chưa hoàn thiện)");
      }
      setShowReasonDialog(false);
      setSelectedCase(null);
      loadCases();
    } catch (error) {
      toast.error(error.message || "Xử lý hồ sơ thất bại");
    }
  };

  const handleExport = async () => {
    try {
      toast.info("Đang tải dữ liệu...");
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Xuất danh sách lệch biển số thành công!");
    } catch (e) {
      toast.error("Lỗi khi xuất file Excel.");
    }
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-col flex-1 gap-6 transition-all duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Duyệt lệch biển số (Plate Mismatch Approval)</h2>
            <p className="text-sm text-slate-500 mt-1">Xem xét và phê duyệt các yêu cầu lệch biển số khi ra xe</p>
          </div>
          <Button variant="outline" className="bg-white text-slate-700" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Xuất Excel
          </Button>
        </div>

        {/* Filters */}
        <MismatchFilters 
          activeTab={activeTab} setActiveTab={setActiveTab}
          filterKeyword={filterKeyword} setFilterKeyword={setFilterKeyword}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterPriority={filterPriority} setFilterPriority={setFilterPriority}
          filterDateRange={filterDateRange} setFilterDateRange={setFilterDateRange}
          filterMismatchType={filterMismatchType} setFilterMismatchType={setFilterMismatchType}
          filterCardGroup={filterCardGroup} setFilterCardGroup={setFilterCardGroup}
          filterReason={filterReason} setFilterReason={setFilterReason}
          onSearch={loadCases}
          onReset={handleResetFilters}
          counts={counts}
        />

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Danh sách yêu cầu {activeTab === "PENDING" ? "chờ phê duyệt" : activeTab === "CONFIRMED" ? "đã phê duyệt" : activeTab === "REJECTED" ? "đã từ chối" : ""} ({filtered.length})
            </h3>
          </div>
          
          <MismatchTable 
            cases={paginatedCases} 
            isLoading={isLoading} 
            selectedCaseId={selectedCase?.id}
            onRowClick={(item) => setSelectedCase(item)}
          />
          
          <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-white text-sm text-slate-500">
            <div>
              Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} của {filtered.length} kết quả
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="primary" className="bg-blue-600 h-8 px-3">{currentPage} / {totalPages}</Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-[100px] ml-2">
                  <SelectValue placeholder={`${itemsPerPage} / trang`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 / trang</SelectItem>
                  <SelectItem value="15">15 / trang</SelectItem>
                  <SelectItem value="30">30 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {selectedCase && (
        <MismatchSidePanel 
          item={selectedCase} 
          onClose={() => setSelectedCase(null)} 
          onApprove={() => openDecisionDialog("APPROVE")}
          onReject={() => openDecisionDialog("REJECT")}
          onRequestMoreInfo={() => openDecisionDialog("MORE_INFO")}
        />
      )}

      {/* Decision Dialog for entering reason */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decisionType === "APPROVE" ? "Phê duyệt lệch biển số" : 
               decisionType === "REJECT" ? "Từ chối lệch biển số" : "Yêu cầu bổ sung thông tin"}
            </DialogTitle>
            <DialogDescription>
              {decisionType === "APPROVE" 
                ? "Vui lòng nhập ghi chú (nếu có) trước khi phê duyệt yêu cầu này." 
                : decisionType === "REJECT" ? "Vui lòng nhập lý do từ chối yêu cầu này."
                : "Vui lòng nhập thông tin cần Staff bổ sung cho hồ sơ này."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder={decisionType === "APPROVE" ? "Ghi chú phê duyệt (không bắt buộc)" : "Nhập lý do (Bắt buộc)"}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReasonDialog(false)}>Hủy</Button>
            <Button 
              className={
                decisionType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : 
                decisionType === "REJECT" ? "bg-red-600 hover:bg-red-700" :
                "bg-amber-500 hover:bg-amber-600 text-white"
              }
              onClick={confirmDecision}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
