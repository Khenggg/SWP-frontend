import React, { useState } from "react";
import { pricingService } from "../../services/pricingService";
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

function formatVND(amount) { return Number(amount).toLocaleString("vi-VN") + "đ"; }

import { COMMON_STATUS } from "@/constants";

const STATUS_BADGE = {
  [COMMON_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  [COMMON_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
};

const EMPTY_FORM = { vehicleTypeId: "", dayPrice: "", nightPrice: "", monthlyPrice: "", lostCardFee: "", effectiveFrom: "", status: COMMON_STATUS.ACTIVE };

export default function PricingManagementPage() {
  const [rules, setRules] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  React.useEffect(() => {
    const fetchPricing = async () => {
      try {
        const rulesData = await pricingService.getPricingRules();
        setRules(rulesData);
        const types = await parkingService.getVehicleTypes();
        setVehicleTypes(types);
      } catch (e) {
        console.error("Lỗi lấy cấu hình giá:", e);
      }
    };
    fetchPricing();
  }, []);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const filtered = rules.filter((r) => {
    const matchVehicle = filterVehicle === "ALL" || r.vehicleTypeName === filterVehicle;
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchVehicle && matchStatus;
  });

  const validate = (data) => {
    const errs = {};
    if (!data.vehicleTypeId) errs.vehicleTypeId = "Bắt buộc";
    if (!data.effectiveFrom) errs.effectiveFrom = "Bắt buộc";
    const fields = ["dayPrice", "nightPrice", "monthlyPrice", "lostCardFee"];
    fields.forEach((f) => {
      if (data[f] === "" || data[f] === undefined) { errs[f] = "Bắt buộc"; }
      else if (Number(data[f]) < 0) { errs[f] = "Phải >= 0"; }
    });
    return errs;
  };

  const openCreate = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      vehicleTypeId: String(rule.vehicleTypeId),
      dayPrice: String(rule.dayPrice),
      nightPrice: String(rule.nightPrice),
      monthlyPrice: String(rule.monthlyPrice),
      lostCardFee: String(rule.lostCardFee),
      effectiveFrom: rule.effectiveFrom,
      status: rule.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const vt = vehicleTypes.find((v) => String(v.id) === String(form.vehicleTypeId));
    const payload = {
      vehicleTypeId: Number(form.vehicleTypeId),
      vehicleTypeName: vt?.name || "",
      dayPrice: Number(form.dayPrice),
      nightPrice: Number(form.nightPrice),
      monthlyPrice: Number(form.monthlyPrice),
      lostCardFee: Number(form.lostCardFee),
      effectiveFrom: form.effectiveFrom,
      status: form.status,
    };
    try {
      if (editingRule) {
        await pricingService.updatePricingRule(editingRule.id, payload);
        toast.success("Cập nhật bảng giá thành công!");
      } else {
        await pricingService.addPricingRule(payload);
        toast.success("Tạo bảng giá thành công!");
      }
      const updatedRules = await pricingService.getPricingRules();
      setRules(updatedRules);
      setShowModal(false);
    } catch (e) {
      toast.error(e.message || "Lưu bảng giá thất bại!");
    }
  };

  const MoneyField = ({ label, name }) => (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-600 uppercase">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <Input type="number" min="0" value={form[name] || ""} onChange={(e) => setField(name, e.target.value)}
          className={`pr-8 ${formErrors[name] ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""}`} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">đ</span>
      </div>
      {formErrors[name] && <p className="text-red-500 text-xs">{formErrors[name]}</p>}
      {form[name] && !formErrors[name] && <p className="text-slate-400 text-xs">{formatVND(Number(form[name]))}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Bảng Giá</h2>
          <p className="text-sm text-slate-500 mt-0.5">Cấu hình biểu phí gửi xe theo loại xe</p>
        </div>
        <Button onClick={openCreate}>+ Tạo Bảng Giá</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <Select value={filterVehicle} onValueChange={setFilterVehicle}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả loại xe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại xe</SelectItem>
            {vehicleTypes.map((v) => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value={COMMON_STATUS.ACTIVE}>ACTIVE</SelectItem>
            <SelectItem value={COMMON_STATUS.INACTIVE}>INACTIVE</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} bảng giá</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
              <TableHead className="px-5 py-3 text-left">Loại Xe</TableHead>
              <TableHead className="px-5 py-3 text-right">Giá Ban Ngày</TableHead>
              <TableHead className="px-5 py-3 text-right">Giá Ban Đêm</TableHead>
              <TableHead className="px-5 py-3 text-right">Vé Tháng</TableHead>
              <TableHead className="px-5 py-3 text-right">Phí Mất Thẻ</TableHead>
              <TableHead className="px-5 py-3 text-center">Hiệu Lực Từ</TableHead>
              <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
              <TableHead className="px-5 py-3 text-center">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="px-5 py-12 text-center text-slate-400 font-semibold">Chưa có bảng giá</TableCell></TableRow>
            ) : filtered.map((rule) => (
              <TableRow key={rule.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="px-5 py-3 font-bold text-slate-800">{rule.vehicleTypeName}</TableCell>
                <TableCell className="px-5 py-3 text-right font-semibold text-slate-700">{formatVND(rule.dayPrice)}</TableCell>
                <TableCell className="px-5 py-3 text-right font-semibold text-slate-700">{formatVND(rule.nightPrice)}</TableCell>
                <TableCell className="px-5 py-3 text-right font-bold text-emerald-700">{formatVND(rule.monthlyPrice)}</TableCell>
                <TableCell className="px-5 py-3 text-right font-semibold text-red-600">{formatVND(rule.lostCardFee)}</TableCell>
                <TableCell className="px-5 py-3 text-center text-slate-500">{rule.effectiveFrom}</TableCell>
                <TableCell className="px-5 py-3 text-center">
                  <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[rule.status]}`}>{rule.status}</Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-center">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(rule)} className="text-xs font-bold text-blue-600 hover:text-blue-700">Sửa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 font-semibold dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30">
        ⚠️ Phiên gửi xe đang hoạt động dùng bảng giá tại thời điểm xe vào (pricing snapshot). Thay đổi bảng giá không ảnh hưởng đến phiên đang chạy.
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Sửa Bảng Giá" : "Tạo Bảng Giá Mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Giá Ban Ngày" name="dayPrice" />
              <MoneyField label="Giá Ban Đêm" name="nightPrice" />
              <MoneyField label="Vé Tháng" name="monthlyPrice" />
              <MoneyField label="Phí Mất Thẻ" name="lostCardFee" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Hiệu Lực Từ <span className="text-red-500">*</span></label>
              <Input type="date" value={form.effectiveFrom || ""} onChange={(e) => setField("effectiveFrom", e.target.value)}
                className={formErrors.effectiveFrom ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""} />
              {formErrors.effectiveFrom && <p className="text-red-500 text-xs">{formErrors.effectiveFrom}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Trạng Thái</label>
              <div className="flex gap-4">
                {[COMMON_STATUS.ACTIVE, COMMON_STATUS.INACTIVE].map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pricingStatus" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-blue-600" />
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[s]}`}>{s}</Badge>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editingRule ? "Cập Nhật" : "Tạo Bảng Giá"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
