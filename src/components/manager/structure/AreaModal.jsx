import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AreaModal({ isOpen, onClose, editingItem, form, setField, handleSave, floors, vehicleTypes }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Sửa Khu Vực" : "Thêm Khu Vực"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Tầng *</label>
            <Select 
              value={form.floorId?.toString() || ""} 
              onValueChange={(val) => setField("floorId", Number(val))}
            >
              <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
              <SelectContent>
                {floors.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.code || f.floorCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Mã khu *</label>
            <Input 
              value={form.areaCode || ""} 
              onChange={(e) => setField("areaCode", e.target.value.toUpperCase())} 
              placeholder="VD: A1" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Tên khu *</label>
            <Input 
              value={form.areaName || ""} 
              onChange={(e) => setField("areaName", e.target.value)} 
              placeholder="VD: Khu A1" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Loại xe *</label>
            <Select 
              value={form.vehicleTypeIds?.[0]?.toString() || ""} 
              onValueChange={(val) => setField("vehicleTypeIds", [Number(val)])}
            >
              <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(v => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
