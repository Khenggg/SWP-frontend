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

export default function SlotModal({ isOpen, onClose, form, setField, handleSave, areas, vehicleTypes }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Thêm Slot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Khu vực *</label>
            <Select 
              value={form.areaId?.toString() || ""} 
              onValueChange={(val) => setField("areaId", Number(val))}
            >
              <SelectTrigger><SelectValue placeholder="Chọn khu..." /></SelectTrigger>
              <SelectContent>
                {areas.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.code || a.areaCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Mã Slot *</label>
            <Input 
              value={form.slotCode || ""} 
              onChange={(e) => setField("slotCode", e.target.value.toUpperCase())} 
              placeholder="VD: B1-A-01" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Loại xe *</label>
            <Select 
              value={form.allowedVehicleTypeId?.toString() || ""} 
              onValueChange={(val) => setField("allowedVehicleTypeId", Number(val))}
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
