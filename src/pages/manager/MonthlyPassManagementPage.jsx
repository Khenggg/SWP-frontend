import React, { useState, useEffect } from "react";
import { vehicleService } from "../../services/vehicleService";
import { parkingService } from "../../services/parkingService";
import { PASS_STATUS } from "@/constants";
import MonthlyPassFilters from "@/components/manager/monthly-pass/MonthlyPassFilters";
import MonthlyPassTable from "@/components/manager/monthly-pass/MonthlyPassTable";
import MonthlyPassSidePanel from "@/components/manager/monthly-pass/MonthlyPassSidePanel";
import { toast } from "sonner";
import { Calendar, CheckCircle, Clock, Lock, RefreshCw, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_BADGE = {
  [PASS_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-300",
  [PASS_STATUS.EXPIRED]: "bg-slate-100 text-slate-500 border-slate-300",
  [PASS_STATUS.LOCKED]: "bg-red-100 text-red-700 border-red-300",
  [PASS_STATUS.CANCELLED]: "bg-amber-100 text-amber-700 border-amber-300",
};

const STATUSES = Object.values(PASS_STATUS);
const EMPTY_FORM = { ownerName: "", phone: "", plate: "", vehicleTypeId: "", startDate: "", endDate: "" };

export default function MonthlyPassManagementPage() {
  const [passes, setPasses] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("");

  const [selectedPass, setSelectedPass] = useState(null);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [renewDate, setRenewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const passesData = await vehicleService.getMonthlyPasses();
      setPasses(passesData || []);
      const types = await parkingService.getVehicleTypes();
      setVehicleTypes(types || []);
    } catch (e) {
      console.error("Lỗi lấy danh sách vé tháng:", e);
      toast.error("Không thể tải dữ liệu vé tháng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const filtered = passes.filter((p) => {
    let effectiveStatus = p.status;
    if (p.status === PASS_STATUS.ACTIVE && p.endDate) {
      const remainingDays = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (remainingDays < 0) {
        effectiveStatus = PASS_STATUS.EXPIRED;
      }
    }

    const matchStatus = filterStatus === "ALL" || effectiveStatus === filterStatus;
    const matchVehicle = filterVehicle === "ALL" || p.vehicleTypeName === filterVehicle;
    const matchSearch = !filterKeyword || 
      (p.plate && p.plate.toLowerCase().includes(filterKeyword.toLowerCase())) || 
      (p.ownerName && p.ownerName.toLowerCase().includes(filterKeyword.toLowerCase())) ||
      (p.phone && p.phone.includes(filterKeyword));
    
    return matchStatus && matchVehicle && matchSearch;
  });

  // Summary counts
  const countTotal = passes.length;
  const countActive = passes.filter(p => p.status === PASS_STATUS.ACTIVE).length;
  const countExpired = passes.filter(p => p.status === PASS_STATUS.EXPIRED || (p.status === PASS_STATUS.ACTIVE && p.endDate < new Date().toISOString().split("T")[0])).length;
  const countLocked = passes.filter(p => p.status === PASS_STATUS.LOCKED).length;
  const countExpiringSoon = passes.filter(p => {
    if (p.status !== PASS_STATUS.ACTIVE || !p.endDate) return false;
    const end = new Date(p.endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days >= 0 && days <= 7;
  }).length;
  // Giả lập renew count (không có API thật thì fix nhẹ)
  const countRenewed = 205;

  const validate = (data) => {
    const errs = {};
    if (!data.ownerName?.trim()) errs.ownerName = "Bắt buộc";
    if (!data.plate?.trim()) errs.plate = "Bắt buộc";
    if (!data.vehicleTypeId) errs.vehicleTypeId = "Bắt buộc";
    if (!data.startDate) errs.startDate = "Bắt buộc";
    if (!data.endDate) errs.endDate = "Bắt buộc";
    if (data.startDate && data.endDate && data.endDate < data.startDate) errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    return errs;
  };

  const handleSavePass = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const vt = vehicleTypes.find((v) => String(v.id) === String(form.vehicleTypeId));
    const passData = {
      ownerName: form.ownerName, phone: form.phone, plate: form.plate.toUpperCase(),
      vehicleTypeId: Number(form.vehicleTypeId), vehicleTypeName: vt?.name || "",
      startDate: form.startDate, endDate: form.endDate, status: PASS_STATUS.ACTIVE,
    };
    
    try {
      if (isEditing) {
         // [CHƯA HOÀN THIỆN TỪ BACKEND] API PUT /monthly-passes/{id}
         // Sử dụng mock hoặc fallback error, hiện tại cứ alert
         toast.info("[CHƯA HOÀN THIỆN TỪ BACKEND] Chức năng sửa vé chưa gọi API thật");
      } else {
         await vehicleService.addMonthlyPass(passData);
         toast.success("Tạo vé tháng thành công!");
      }
      loadData();
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
    } catch (e) {
      toast.error(e.message || "Lưu vé tháng thất bại!");
    }
  };

  const handleRenew = async () => {
    if (!renewDate) return;
    if (renewDate <= selectedPass.endDate) { toast.error("Ngày gia hạn phải sau ngày kết thúc hiện tại!"); return; }
    try {
      await vehicleService.renewMonthlyPass(selectedPass.id, renewDate);
      loadData();
      setShowRenew(false);
      // Update selectedPass view locally
      setSelectedPass({ ...selectedPass, endDate: renewDate });
      toast.success(`Gia hạn vé ${selectedPass.plate} đến ${renewDate}`);
    } catch (e) {
      toast.error(e.message || "Gia hạn vé tháng thất bại!");
    }
  };

  const handleStatus = async () => {
    try {
      await vehicleService.updateMonthlyPassStatus(selectedPass.id, newStatus);
      loadData();
      setShowStatusModal(false);
      // Update locally
      setSelectedPass({ ...selectedPass, status: newStatus });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (e) {
      toast.error(e.message || "Cập nhật trạng thái thất bại!");
    }
  };

  const handleLockToggle = async (pass) => {
    const nextStatus = pass.status === PASS_STATUS.LOCKED ? PASS_STATUS.ACTIVE : PASS_STATUS.LOCKED;
    try {
      await vehicleService.updateMonthlyPassStatus(pass.id, nextStatus);
      loadData();
      if (selectedPass?.id === pass.id) {
         setSelectedPass({ ...selectedPass, status: nextStatus });
      }
      toast.success(nextStatus === PASS_STATUS.LOCKED ? "Khóa vé thành công!" : "Mở khóa thành công!");
    } catch (e) {
      toast.error(e.message || "Cập nhật khóa vé thất bại!");
    }
  };

  const handleResetFilters = () => {
    setFilterKeyword("");
    setFilterVehicle("ALL");
    setFilterStatus("ALL");
    setFilterDateRange("");
  };

  const InputField = ({ label, name, type = "text", placeholder, required }) => (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-600 uppercase">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <Input type={type} value={form[name] || ""} onChange={(e) => setField(name, e.target.value)} placeholder={placeholder}
        className={formErrors[name] ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""} />
      {formErrors[name] && <p className="text-red-500 text-xs">{formErrors[name]}</p>}
    </div>
  );

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-col flex-1 gap-6 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Vé tháng</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý danh sách vé tháng, gia hạn, trạng thái và kiểm tra hiệu lực sử dụng khi xe vào/ra.</p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Tổng vé tháng</p>
              <p className="text-xl font-bold text-slate-800">{countTotal.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Đang hoạt động</p>
              <p className="text-xl font-bold text-slate-800">{countActive.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Sắp hết hạn</p>
              <p className="text-xl font-bold text-slate-800">{countExpiringSoon.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 flex-shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Đã hết hạn</p>
              <p className="text-xl font-bold text-slate-800">{countExpired.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Bị khóa</p>
              <p className="text-xl font-bold text-slate-800">{countLocked.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Gia hạn tháng này</p>
              <p className="text-xl font-bold text-slate-800">{countRenewed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <MonthlyPassFilters 
          filterKeyword={filterKeyword} setFilterKeyword={setFilterKeyword}
          filterVehicle={filterVehicle} setFilterVehicle={setFilterVehicle}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterDateRange={filterDateRange} setFilterDateRange={setFilterDateRange}
          vehicleTypes={vehicleTypes}
          onSearch={loadData}
          onReset={handleResetFilters}
          onCreate={() => { setForm(EMPTY_FORM); setFormErrors({}); setIsEditing(false); setShowCreate(true); }}
        />

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
          <MonthlyPassTable 
            passes={filtered} 
            isLoading={isLoading} 
            selectedPassId={selectedPass?.id}
            onRowClick={(p) => setSelectedPass(p)}
            onEdit={(p) => {
              setForm({ ownerName: p.ownerName, phone: p.phone, plate: p.plate || p.plateNumber, vehicleTypeId: String(p.vehicleTypeId || ""), startDate: p.startDate, endDate: p.endDate });
              setFormErrors({});
              setIsEditing(true);
              setShowCreate(true);
            }}
            onRenew={(p) => { setSelectedPass(p); setRenewDate(""); setShowRenew(true); }}
            onLockToggle={handleLockToggle}
          />
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-white">
            <div>Hiển thị {filtered.length > 0 ? 1 : 0} - {filtered.length} trong tổng số {filtered.length} vé</div>
          </div>
        </div>
      </div>

      {selectedPass && (
        <MonthlyPassSidePanel 
          pass={selectedPass} 
          onClose={() => setSelectedPass(null)} 
          onEdit={(p) => {
            setForm({ ownerName: p.ownerName, phone: p.phone, plate: p.plate || p.plateNumber, vehicleTypeId: String(p.vehicleTypeId || ""), startDate: p.startDate, endDate: p.endDate });
            setFormErrors({});
            setIsEditing(true);
            setShowCreate(true);
          }}
          onRenew={(p) => { setSelectedPass(p); setRenewDate(""); setShowRenew(true); }}
          onStatusChange={(p) => { setSelectedPass(p); setNewStatus(p.status); setShowStatusModal(true); }}
          onLockToggle={handleLockToggle}
        />
      )}

      {/* Create / Edit Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Chỉnh sửa Vé Tháng" : "Tạo Vé Tháng Mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <InputField label="Họ Tên Chủ Xe" name="ownerName" placeholder="Nguyễn Văn A" required />
            <InputField label="Điện Thoại" name="phone" placeholder="09xxxxxxxx" />
            <InputField label="Biển Số Xe" name="plate" placeholder="51A-12345" required />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Loại Xe <span className="text-red-500">*</span></label>
              <Select value={form.vehicleTypeId || ""} onValueChange={(val) => setField("vehicleTypeId", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.vehicleTypeId && <p className="text-red-500 text-xs">{formErrors.vehicleTypeId}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Từ Ngày" name="startDate" type="date" required />
              <InputField label="Đến Ngày" name="endDate" type="date" required />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleSavePass} className="bg-blue-600 hover:bg-blue-700 text-white">{isEditing ? "Lưu thay đổi" : "Tạo Vé Tháng"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Modal */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gia Hạn Vé: {selectedPass?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">Ngày hết hạn hiện tại: <strong className="text-red-600">{selectedPass?.endDate}</strong></p>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Ngày Hết Hạn Mới <span className="text-red-500">*</span></label>
              <Input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} min={selectedPass?.endDate} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenew(false)}>Hủy</Button>
            <Button onClick={handleRenew} className="bg-emerald-600 hover:bg-emerald-700 text-white">Gia Hạn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi Trạng Thái: {selectedPass?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                <input type="radio" name="passStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-blue-600" />
                <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[s]}`}>{s}</Badge>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Hủy</Button>
            <Button onClick={handleStatus} className="bg-amber-600 hover:bg-amber-700 text-white">Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
