import React, { useState, useEffect } from "react";
import { cardService } from "../../services/cardService";
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
import { CARD_STATUS } from "@/constants";

const CARD_STATUS_BADGE = {
  [CARD_STATUS.AVAILABLE]: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  [CARD_STATUS.IN_USE]: "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  [CARD_STATUS.LOST]: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  [CARD_STATUS.DAMAGED]: "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  [CARD_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
};

const STATUSES = Object.values(CARD_STATUS);

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("vi-VN");
}

export default function CardManagementPage() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchCode, setSearchCode] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [form, setForm] = useState({ code: "", note: "" });
  const [newStatus, setNewStatus] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await cardService.getCards();
        setCards(data);
      } catch (e) {
        console.error("Lỗi lấy danh sách thẻ:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, []);

  const filtered = cards.filter((c) => {
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchSearch = !searchCode || c.code.toLowerCase().includes(searchCode.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreate = async () => {
    if (!form.code.trim()) { setFormErrors({ code: "Mã thẻ bắt buộc" }); return; }
    try {
      await cardService.addCard(form.code.trim(), form.note);
      const data = await cardService.getCards();
      setCards(data);
      setShowCreate(false);
      setForm({ code: "", note: "" });
      setFormErrors({});
      toast.success("Tạo thẻ thành công!");
    } catch (e) {
      setFormErrors({ code: e.message });
    }
  };

  const openStatusModal = (card) => {
    if (card.status === "IN_USE") {
      toast.error("Không thể đổi trạng thái thẻ đang được sử dụng!");
      return;
    }
    setSelectedCard(card);
    setNewStatus(card.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!window.confirm(`Xác nhận đổi trạng thái thẻ ${selectedCard.code} sang ${newStatus}?`)) return;
    try {
      await cardService.updateCardStatus(selectedCard.id, newStatus);
      const data = await cardService.getCards();
      setCards(data);
      setShowStatusModal(false);
      toast.success(`Đã cập nhật trạng thái thẻ ${selectedCard.code}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Summary counts
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: cards.filter((c) => c.status === s).length }), {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Thẻ Xe</h2>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý danh sách thẻ NFC và trạng thái thẻ</p>
        </div>
        <Button onClick={() => { setForm({ code: "", note: "" }); setFormErrors({}); setShowCreate(true); }}>
          + Tạo thẻ mới
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STATUSES.map((s) => (
          <div key={s} className={`rounded-xl border p-3 text-center cursor-pointer transition-all ${filterStatus === s ? "ring-2 ring-blue-400" : ""} ${CARD_STATUS_BADGE[s].replace("text-", "border-").split(" ")[2]} bg-white`}
            onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}>
            <p className="text-2xl font-black text-slate-800">{counts[s] || 0}</p>
            <p className={`text-xs font-black ${CARD_STATUS_BADGE[s].split(" ")[1]}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <Input 
          type="text" 
          placeholder="🔍 Tìm mã thẻ..." 
          value={searchCode} 
          onChange={(e) => setSearchCode(e.target.value)}
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
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} thẻ</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded"/>)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon="💳"
            title="Không có thẻ phù hợp"
            description="Bấm nút 'Tạo thẻ mới' để bắt đầu khai báo và cấp thẻ vào hệ thống."
            className="border-0 shadow-none rounded-none"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <TableHead className="px-5 py-3 text-left">Mã Thẻ</TableHead>
                <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
                <TableHead className="px-5 py-3 text-left">Phiên Hiện Tại</TableHead>
                <TableHead className="px-5 py-3 text-left">Ghi Chú</TableHead>
                <TableHead className="px-5 py-3 text-center">Cập Nhật</TableHead>
                <TableHead className="px-5 py-3 text-center">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filtered.map((card) => (
                <TableRow key={card.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="px-5 py-3 font-mono font-bold text-slate-800">{card.code}</TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${CARD_STATUS_BADGE[card.status]}`}>{card.status}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-slate-500">
                    {card.activeSession ? (
                      <span className="text-xs"><span className="font-mono font-bold text-blue-700">{card.activeSession.plate}</span> • {card.activeSession.sessionCode}</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-slate-400 text-xs">{card.note || "—"}</TableCell>
                  <TableCell className="px-5 py-3 text-center text-slate-400 text-xs">{formatDate(card.updatedAt)}</TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openStatusModal(card)}
                      disabled={card.status === "IN_USE"}
                      className={`text-xs font-bold ${card.status === "IN_USE" ? "text-slate-300 cursor-not-allowed" : "text-amber-600 hover:text-amber-700"}`}
                    >
                      Đổi Trạng Thái
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Thẻ Xe Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Mã Thẻ <span className="text-red-500">*</span></label>
              <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="VD: CARD-0009"
                className={`font-mono ${formErrors.code ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""}`} />
              {formErrors.code && <p className="text-red-500 text-xs">{formErrors.code}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Ghi Chú</label>
              <Input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Tùy chọn..." />
            </div>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
              QR Token sẽ được backend tự động sinh khi tạo thẻ. Thẻ mới mặc định trạng thái AVAILABLE.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo Thẻ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi Trạng Thái: {selectedCard?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">Trạng thái hiện tại: <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${selectedCard ? CARD_STATUS_BADGE[selectedCard.status] : ""}`}>{selectedCard?.status}</Badge></p>
            <div className="space-y-2">
              {STATUSES.filter((s) => s !== "IN_USE").map((s) => (
                <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                  <input type="radio" name="newStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-amber-600" />
                  <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${CARD_STATUS_BADGE[s]}`}>{s}</Badge>
                </label>
              ))}
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              ⚠️ Thẻ đang IN_USE không thể đổi trạng thái. Thao tác này sẽ được ghi vào audit log.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Hủy</Button>
            <Button onClick={handleStatusChange} className="bg-amber-600 hover:bg-amber-700 text-white">Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
