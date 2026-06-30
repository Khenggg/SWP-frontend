import React, { useState, useEffect } from "react";
import { cardService } from "@/services/cardService";
import { auditService } from "@/services/auditService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import EmptyState from "@/components/ui/empty-state";
import { CARD_STATUS } from "@/constants";
import { Search, RefreshCw, Eye, Plus, EyeOff } from "lucide-react";

import CardStatCards from "@/components/manager/card/CardStatCards";
import CreateCardModal from "@/components/manager/card/CreateCardModal";
import UpdateCardStatusModal from "@/components/manager/card/UpdateCardStatusModal";
import CardDetailSidebar from "@/components/manager/card/CardDetailSidebar";

const CARD_STATUS_BADGE = {
  [CARD_STATUS.AVAILABLE]: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  [CARD_STATUS.IN_USE]: "bg-blue-100 text-blue-700 border border-blue-300",
  [CARD_STATUS.LOST]: "bg-red-100 text-red-700 border border-red-300",
  [CARD_STATUS.DAMAGED]: "bg-amber-100 text-amber-700 border border-amber-300",
  [CARD_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border border-slate-300",
};

const STATUS_LABELS = {
  [CARD_STATUS.AVAILABLE]: "Khả dụng",
  [CARD_STATUS.IN_USE]: "Đang sử dụng",
  [CARD_STATUS.LOST]: "Bị mất",
  [CARD_STATUS.DAMAGED]: "Bị hỏng",
  [CARD_STATUS.INACTIVE]: "Ngừng hoạt động",
};

export default function CardManagementPage() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchCode, setSearchCode] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Form states
  const [form, setForm] = useState({ code: "", note: "" });
  const [newStatus, setNewStatus] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const data = await cardService.getCards();
      setCards(data);
      if (selectedCard) {
        const updated = data.find(c => c.id === selectedCard.id);
        if (updated) setSelectedCard(updated);
      }
    } catch (e) {
      toast.error("Lỗi lấy danh sách thẻ: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCard) {
      fetchAuditLogs(selectedCard.cardNumber || selectedCard.code);
    } else {
      setAuditLogs([]);
    }
  }, [selectedCard]);

  const fetchAuditLogs = async (queryCode) => {
    setIsLogsLoading(true);
    try {
      const data = await auditService.getAuditLogs({ keyword: queryCode });
      setAuditLogs(data.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handleRefresh = () => {
    setFilterStatus("ALL");
    setSearchCode("");
    fetchCards();
  };

  const filtered = cards.filter((c) => {
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    const code = c.cardNumber || c.code || "";
    const qr = c.qrToken || "";
    const matchSearch = !searchCode || 
      code.toLowerCase().includes(searchCode.toLowerCase()) ||
      qr.toLowerCase().includes(searchCode.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreate = async () => {
    if (!form.code.trim()) { setFormErrors({ code: "Mã thẻ bắt buộc" }); return; }
    try {
      await cardService.addCard(form.code.trim(), form.note);
      await fetchCards();
      setShowCreate(false);
      setForm({ code: "", note: "" });
      setFormErrors({});
      toast.success("Tạo thẻ thành công!");
    } catch (e) {
      setFormErrors({ code: e.message });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedCard) return;
    try {
      await cardService.updateCardStatus(selectedCard.id, newStatus);
      await fetchCards();
      setShowStatusModal(false);
      toast.success("Đổi trạng thái thành công!");
    } catch (e) {
      toast.error(e.message);
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

  const stats = {
    total: cards.length,
    available: cards.filter(c => c.status === CARD_STATUS.AVAILABLE).length,
    inUse: cards.filter(c => c.status === CARD_STATUS.IN_USE).length,
    lost: cards.filter(c => c.status === CARD_STATUS.LOST).length,
    damaged: cards.filter(c => c.status === CARD_STATUS.DAMAGED).length,
    inactive: cards.filter(c => c.status === CARD_STATUS.INACTIVE).length,
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Thẻ đỗ xe</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tạo thẻ, quản lý QR token, theo dõi phiên hiện tại và cập nhật trạng thái thẻ.
        </p>
      </div>

      <CardStatCards stats={stats} />

      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
        <div className={`flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm h-full transition-all duration-300 ${selectedCard ? "w-full lg:w-[calc(100%-366px)] hidden lg:flex" : "w-full"}`}>
          
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-gray-50/50 rounded-t-xl">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Tìm theo mã thẻ, mã QR..." 
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="pl-9 bg-white border-gray-200"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  {Object.values(CARD_STATUS).map(s => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleRefresh} className="bg-white" title="Làm mới">
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            
            <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Thêm thẻ mới
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[120px]">Mã thẻ</TableHead>
                  <TableHead className="w-[140px]">QR Token</TableHead>
                  <TableHead className="w-[140px]">Trạng thái</TableHead>
                  <TableHead className="w-[140px]">Session hiện tại</TableHead>
                  <TableHead className="text-right w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">Đang tải dữ liệu...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64">
                      <EmptyState icon={<EyeOff className="w-12 h-12" />} title="Không tìm thấy thẻ xe" description="Thử thay đổi bộ lọc hoặc tìm kiếm khác." />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow 
                      key={c.id} 
                      className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedCard?.id === c.id ? "bg-blue-50" : ""}`}
                      onClick={() => setSelectedCard(c)}
                    >
                      <TableCell className="font-bold text-gray-900">{c.cardNumber || c.code}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-[120px] inline-block" title={c.qrToken}>
                          {c.qrToken ? c.qrToken.substring(0, 12) + "..." : "---"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={CARD_STATUS_BADGE[c.status]}>
                          {STATUS_LABELS[c.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-600">{c.currentSessionId || "-"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedCard(c)} title="Xem chi tiết">
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openStatusModal(c)} title="Đổi trạng thái">
                            <RefreshCw className="h-4 w-4 text-amber-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 flex justify-between items-center">
            <span>Hiển thị {filtered.length} trong {cards.length} kết quả</span>
          </div>
        </div>

        <CardDetailSidebar 
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          openStatusModal={openStatusModal}
          isLogsLoading={isLogsLoading}
          auditLogs={auditLogs}
        />
      </div>

      <CreateCardModal 
        isOpen={showCreate}
        onClose={setShowCreate}
        form={form}
        setForm={setForm}
        formErrors={formErrors}
        handleCreate={handleCreate}
      />

      <UpdateCardStatusModal 
        isOpen={showStatusModal}
        onClose={setShowStatusModal}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        handleUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
