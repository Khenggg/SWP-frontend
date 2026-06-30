import React from "react";
import { Search, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditLogFilters({ 
  filterKeyword, setFilterKeyword,
  filterAction, setFilterAction,
  filterTarget, setFilterTarget,
  filterDate, setFilterDate,
  filterRole, setFilterRole,
  filterService, setFilterService,
  mode, // "manager" or "admin"
  onApply,
  onReset,
  isLoading
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Từ khóa</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Tìm theo user ID, đối tượng..." 
            className="pl-9 bg-slate-50"
            value={filterKeyword}
            onChange={e => setFilterKeyword(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-1.5 w-[200px]">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Loại hành động</label>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="bg-slate-50">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="SESSION_CREATED">Tạo phiên</SelectItem>
            <SelectItem value="SESSION_CANCELLED">Hủy phiên</SelectItem>
            <SelectItem value="SLOT_MOVED">Chuyển slot</SelectItem>
            <SelectItem value="PRICING_UPDATED">Cập nhật giá</SelectItem>
            <SelectItem value="USER_CREATED">Tạo người dùng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 w-[200px]">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đối tượng (Target)</label>
        <Select value={filterTarget} onValueChange={setFilterTarget}>
          <SelectTrigger className="bg-slate-50">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="ParkingSession">Phiên gửi xe</SelectItem>
            <SelectItem value="PricingRule">Bảng giá</SelectItem>
            <SelectItem value="User">Người dùng</SelectItem>
            <SelectItem value="Slot">Vị trí đỗ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 w-[150px]">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Thời gian</label>
        <div className="relative">
          <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input 
            type="date" 
            className="bg-slate-50 pr-9" 
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {mode === "admin" && (
        <>
          <div className="flex flex-col gap-1.5 w-[150px]">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service</label>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="CORE_API">CORE_API</SelectItem>
                <SelectItem value="SUPPORT_API">SUPPORT_API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Button variant="primary" className="bg-blue-600 hover:bg-blue-700" onClick={onApply} disabled={isLoading}>
        <Search className="w-4 h-4 mr-2" /> Áp dụng
      </Button>
      <Button variant="outline" onClick={onReset}>
        <RefreshCw className="w-4 h-4 mr-2" /> Đặt lại
      </Button>
    </div>
  );
}
