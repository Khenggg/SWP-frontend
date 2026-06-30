import React from "react";
import { Search, RefreshCw, Plus, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PASS_STATUS } from "@/constants";

export default function MonthlyPassFilters({
  filterKeyword, setFilterKeyword,
  filterVehicle, setFilterVehicle,
  filterStatus, setFilterStatus,
  filterDateRange, setFilterDateRange,
  vehicleTypes,
  onSearch,
  onReset,
  onCreate
}) {
  const [showAlert, setShowAlert] = React.useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[250px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Từ khóa</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Tìm theo mã vé, chủ xe, biển số, số điện thoại..." 
              className="pl-9 bg-slate-50 border-slate-200"
              value={filterKeyword}
              onChange={e => setFilterKeyword(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 w-[160px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Loại xe</label>
          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Tất cả loại xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại xe</SelectItem>
              {vehicleTypes.map(v => (
                <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 w-[160px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value={PASS_STATUS.ACTIVE}>Đang hoạt động (Active)</SelectItem>
              <SelectItem value={PASS_STATUS.EXPIRED}>Đã hết hạn (Expired)</SelectItem>
              <SelectItem value={PASS_STATUS.LOCKED}>Bị khóa (Locked)</SelectItem>
              <SelectItem value={PASS_STATUS.CANCELLED}>Đã hủy (Cancelled)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 w-[220px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Thời hạn</label>
          <Input 
            type="text" 
            placeholder="01/06/2026 - 30/06/2026" 
            className="bg-slate-50 border-slate-200"
            value={filterDateRange}
            onChange={e => setFilterDateRange(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 h-10 px-4" onClick={onSearch}>
            <Search className="w-4 h-4 mr-2" /> Tìm kiếm
          </Button>
          <Button variant="outline" className="h-10 px-4 border-slate-200 text-slate-600" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 h-10 px-4 ml-2" onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" /> Tạo vé tháng
          </Button>
        </div>
      </div>

      {showAlert && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <Info className="w-4 h-4" />
            <span>Khi xe vào/ra, hệ thống kiểm tra vé tháng theo biển số và trạng thái hiệu lực.</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-400 hover:text-blue-600 hover:bg-blue-100" onClick={() => setShowAlert(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
