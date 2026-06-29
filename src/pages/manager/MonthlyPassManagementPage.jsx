import React, { useState } from "react";
import { vehicleService } from "../../services/vehicleService";
import { parkingService } from "../../services/parkingService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import EmptyState from "@/components/ui/empty-state";
import LicensePlate from "@/components/ui/license-plate";
import { PASS_STATUS } from "@/constants";

const STATUS_BADGE = {
  [PASS_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  [PASS_STATUS.EXPIRED]: "bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
  [PASS_STATUS.LOCKED]: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  [PASS_STATUS.CANCELLED]: "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
};

const STATUSES = Object.values(PASS_STATUS);

const EMPTY_FORM = { ownerName: "", phone: "", plate: "", vehicleTypeId: "", startDate: "", endDate: "" };

export default function MonthlyPassManagementPage() {
  const [passes, setPasses] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [renewDate, setRenewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [formErrors, setFormErrors] = useState({});

  React.useEffect(() => {
    const fetchPasses = async () => {
      try {
        const passesData = await vehicleService.getMonthlyPasses();
        setPasses(passesData);
        const types = await parkingService.getVehicleTypes();
        setVehicleTypes(types);
      } catch (e) {
        console.error("Lỗi lấy danh sách vé tháng:", e);
      }
    };
    fetchPasses();
  }, []);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const filtered = passes.filter((p) => {
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchVehicle = filterVehicle === "ALL" || p.vehicleTypeName === filterVehicle;
    const matchSearch = !searchText || p.plate.toLowerCase().includes(searchText.toLowerCase()) || p.ownerName.toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchVehicle && matchSearch;
  });

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

  const handleCreate = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const vt = vehicleTypes.find((v) => String(v.id) === String(form.vehicleTypeId));
    const newPassData = {
      ownerName: form.ownerName, phone: form.phone, plate: form.plate.toUpperCase(),
      vehicleTypeId: Number(form.vehicleTypeId), vehicleTypeName: vt?.name || "",
      startDate: form.startDate, endDate: form.endDate, status: PASS_STATUS.ACTIVE,
    };
    try {
      await vehicleService.addMonthlyPass(newPassData);
      const passesData = await vehicleService.getMonthlyPasses();
      setPasses(passesData);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      toast.success("Tạo vé tháng thành công!");
    } catch (e) {
      toast.error(e.message || "Tạo vé tháng thất bại!");
    }
  };

  const handleRenew = async () => {
    if (!renewDate) return;
    if (renewDate <= selectedPass.endDate) { toast.error("Ngày gia hạn phải sau ngày kết thúc hiện tại!"); return; }
    try {
      await vehicleService.renewMonthlyPass(selectedPass.id, renewDate);
      const passesData = await vehicleService.getMonthlyPasses();
      setPasses(passesData);
      setShowRenew(false);
      toast.success(`Gia hạn vé ${selectedPass.plate} đến ${renewDate}`);
    } catch (e) {
      toast.error(e.message || "Gia hạn vé tháng thất bại!");
    }
  };

  const handleStatus = async () => {
    try {
      await vehicleService.updateMonthlyPassStatus(selectedPass.id, newStatus);
      const passesData = await vehicleService.getMonthlyPasses();
      setPasses(passesData);
      setShowStatusModal(false);
      toast.success("Cập nhật trạng thái thành công!");
    } catch (e) {
      toast.error(e.message || "Cập nhật trạng thái thất bại!");
    }
  };

  // Summary counts
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: passes.filter((p) => p.status === s).length }), {});

  const InputField = ({ label, name, type = "text", placeholder, required }) => (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-600 uppercase">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <Input type={type} value={form[name] || ""} onChange={(e) => setField(name, e.target.value)} placeholder={placeholder}
        className={formErrors[name] ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""} />
      {formErrors[name] && <p className="text-red-500 text-xs">{formErrors[name]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Vé Tháng</h2>
          <p className="text-sm text-slate-500 mt-0.5">Đăng ký, gia hạn và quản lý vé tháng theo biển số xe</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowCreate(true); }}>
          + Tạo Vé Tháng
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUSES.map((s) => (
          <div key={s} onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}
            className={`rounded-xl border p-3 text-center cursor-pointer transition-all bg-white ${filterStatus === s ? "ring-2 ring-blue-400" : ""}`}>
            <p className="text-2xl font-black text-slate-800">{counts[s] || 0}</p>
            <p className={`text-xs font-black mt-1 ${STATUS_BADGE[s].split(" ")[1]}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <Input 
          type="text" 
          placeholder="🔍 Biển số / Chủ xe..." 
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-[200px]" 
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterVehicle} onValueChange={setFilterVehicle}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả loại xe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại xe</SelectItem>
            {vehicleTypes.map((v) => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} vé</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState 
            icon="📅"
            title="Không có vé tháng phù hợp"
            description="Bấm nút 'Tạo Vé Tháng' để khai báo đăng ký mới cho cư dân."
            className="border-0 shadow-none rounded-none"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <TableHead className="px-5 py-3 text-left">Chủ Xe</TableHead>
                <TableHead className="px-5 py-3 text-left">Biển Số</TableHead>
                <TableHead className="px-5 py-3 text-left">Loại Xe</TableHead>
                <TableHead className="px-5 py-3 text-center">Từ Ngày</TableHead>
                <TableHead className="px-5 py-3 text-center">Đến Ngày</TableHead>
                <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
                <TableHead className="px-5 py-3 text-center">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filtered.map((pass) => {
                const isExpiring = pass.status === PASS_STATUS.ACTIVE && pass.endDate <= new Date(Date.now() + 7*24*3600*1000).toISOString().split("T")[0];
                return (
                  <TableRow key={pass.id} className={`hover:bg-slate-50 transition-colors ${isExpiring ? "bg-amber-50" : ""}`}>
                    <TableCell className="px-5 py-3">
                      <p className="font-bold text-slate-800">{pass.ownerName}</p>
                      <p className="text-xs text-slate-400">{pass.phone}</p>
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <LicensePlate plate={pass.plate} size="md" />
                    </TableCell>
                    <TableCell className="px-5 py-3 text-slate-600">{pass.vehicleTypeName}</TableCell>
                    <TableCell className="px-5 py-3 text-center text-slate-500">{pass.startDate}</TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <span className={`font-semibold ${isExpiring ? "text-amber-600" : "text-slate-500"}`}>{pass.endDate}</span>
                      {isExpiring && <span className="block text-xs text-amber-500 font-bold">Sắp hết hạn</span>}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[pass.status]}`}>{pass.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedPass(pass); setRenewDate(""); setShowRenew(true); }} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Gia Hạn</Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedPass(pass); setNewStatus(pass.status); setShowStatusModal(true); }} className="text-xs font-bold text-amber-600 hover:text-amber-700">Trạng Thái</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo Vé Tháng Mới</DialogTitle>
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
            <Button onClick={handleCreate}>Tạo Vé Tháng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Modal */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gia Hạn: {selectedPass?.plate}</DialogTitle>
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
                <input type="radio" name="passStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-amber-600" />
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
