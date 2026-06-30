import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { COMMON_STATUS } from "@/constants";

const STATUS_BADGE = {
  [COMMON_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [COMMON_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border-slate-200",
  "SCHEDULED": "bg-orange-100 text-orange-700 border-orange-200",
  "EXPIRED": "bg-gray-100 text-gray-500 border-gray-200"
};

export default function PricingRuleModal({
  isOpen,
  onClose,
  editingRule,
  form,
  setField,
  formErrors,
  handleSave,
  vehicleTypes
}) {
  const MoneyField = ({ label, name }) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <Input type="number" min="0" value={form[name] || ""} onChange={(e) => setField(name, e.target.value)}
          className={`pr-8 ${formErrors[name] ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""}`} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">đ</span>
      </div>
      {formErrors[name] && <p className="text-red-500 text-xs">{formErrors[name]}</p>}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingRule ? "Sửa Rule Giá" : "Tạo Rule Giá Mới"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Loại xe <span className="text-red-500">*</span></label>
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
            <MoneyField label="Giá ban ngày" name="dayPrice" />
            <MoneyField label="Giá ban đêm" name="nightPrice" />
            <MoneyField label="Giá vé tháng" name="monthlyPrice" />
            <MoneyField label="Phí mất thẻ" name="lostCardFee" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Hiệu lực từ <span className="text-red-500">*</span></label>
            <Input type="date" value={form.effectiveFrom || ""} onChange={(e) => setField("effectiveFrom", e.target.value)}
              className={formErrors.effectiveFrom ? "border-red-400 bg-red-50" : ""} />
            {formErrors.effectiveFrom && <p className="text-red-500 text-xs">{formErrors.effectiveFrom}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái</label>
            <div className="flex gap-4">
              {[COMMON_STATUS.ACTIVE, COMMON_STATUS.INACTIVE].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pricingStatus" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-blue-600" />
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${STATUS_BADGE[s]}`}>{s}</Badge>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">{editingRule ? "Cập Nhật" : "Tạo Rule"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
