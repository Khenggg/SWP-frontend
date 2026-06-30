import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LostCardFilters({
  activeTab, setActiveTab,
  filterKeyword, setFilterKeyword,
  filterStatus, setFilterStatus,
  filterPriority, setFilterPriority,
  filterDateRange, setFilterDateRange,
  filterCreator, setFilterCreator,
  filterReason, setFilterReason,
  onSearch,
  onReset,
  counts
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 px-2">
        {[
          { id: "PENDING", label: "Chờ phê duyệt", count: counts?.PENDING },
          { id: "APPROVED", label: "Đã phê duyệt", count: counts?.APPROVED },
          { id: "REJECTED", label: "Đã từ chối", count: counts?.REJECTED },
          { id: "ALL", label: "Tất cả", count: counts?.ALL }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold relative transition-colors ${
              activeTab === tab.id 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-red-500 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter form */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[280px]">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Từ khóa</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Tìm theo mã yêu cầu, thẻ, biển số, người tạo..." 
                className="pl-9 bg-slate-50 border-slate-200"
                value={filterKeyword}
                onChange={e => setFilterKeyword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 w-[160px]">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ phê duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
                <SelectItem value="REJECTED">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-[160px]">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mức độ ưu tiên</label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Tất cả ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="HIGH">Cao</SelectItem>
                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                <SelectItem value="LOW">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-[220px]">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Khoảng thời gian tạo</label>
            <Input 
              type="text" 
              placeholder="01/06/2026 - 21/06/2026" 
              className="bg-slate-50 border-slate-200"
              value={filterDateRange}
              onChange={e => setFilterDateRange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Người tạo (Staff)</label>
            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Tất cả người tạo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {/* Dynamically populated if needed */}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lý do mất thẻ</label>
            <Select value={filterReason} onValueChange={setFilterReason}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Tất cả lý do" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="LOST">Thất lạc</SelectItem>
                <SelectItem value="STOLEN">Mất cắp</SelectItem>
                <SelectItem value="DROPPED">Bị rơi</SelectItem>
                <SelectItem value="UNKNOWN">Không rõ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" className="h-10 px-4 border-slate-200 text-slate-600" onClick={onReset}>
              <RefreshCw className="w-4 h-4 mr-2" /> Đặt lại
            </Button>
            <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 h-10 px-4" onClick={onSearch}>
              <Search className="w-4 h-4 mr-2" /> Tìm kiếm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
