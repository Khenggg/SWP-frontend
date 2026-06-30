import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CARD_STATUS } from "@/constants";

const STATUS_LABELS = {
  [CARD_STATUS.AVAILABLE]: "Khả dụng",
  [CARD_STATUS.IN_USE]: "Đang sử dụng",
  [CARD_STATUS.LOST]: "Bị mất",
  [CARD_STATUS.DAMAGED]: "Bị hỏng",
  [CARD_STATUS.INACTIVE]: "Ngừng hoạt động",
};

export default function UpdateCardStatusModal({ isOpen, onClose, newStatus, setNewStatus, handleUpdateStatus }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái thẻ</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
            <SelectContent>
              {Object.values(CARD_STATUS).map(s => (
                <SelectItem key={s} value={s} disabled={s === CARD_STATUS.IN_USE}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Lưu ý: Không thể chuyển sang trạng thái Đang sử dụng (IN_USE) thủ công.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Hủy</Button>
          <Button onClick={handleUpdateStatus} className="bg-blue-600 text-white hover:bg-blue-700">Cập nhật</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
