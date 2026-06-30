import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateCardModal({ isOpen, onClose, form, setForm, formErrors, handleCreate }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo thẻ mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Mã thẻ *</label>
            <Input 
              value={form.code} 
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
              placeholder="Vd: CARD-001" 
            />
            {formErrors.code && <p className="text-xs text-red-500">{formErrors.code}</p>}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Ghi chú (Tùy chọn)</label>
            <Input 
              value={form.note} 
              onChange={(e) => setForm({ ...form, note: e.target.value })} 
              placeholder="Ghi chú về thẻ..." 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Hủy</Button>
          <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700">Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
