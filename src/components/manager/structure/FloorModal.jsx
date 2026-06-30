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

export default function FloorModal({ isOpen, onClose, editingItem, form, setField, handleSave }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Sửa Tầng" : "Thêm Tầng"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Mã tầng *</label>
            <Input 
              value={form.floorCode || ""} 
              onChange={(e) => setField("floorCode", e.target.value.toUpperCase())} 
              placeholder="VD: B1" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Tên tầng *</label>
            <Input 
              value={form.floorName || ""} 
              onChange={(e) => setField("floorName", e.target.value)} 
              placeholder="VD: Tầng Hầm 1" 
            />
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
