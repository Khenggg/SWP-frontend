import React, { useEffect, useState } from "react";
import { ArrowRightLeft, Ban, RefreshCw, Eye, Search, LockKeyhole, History, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { adminSessionService } from "@/services/adminSessionService";
import { parkingService } from "@/services/parkingService";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_BADGE = {
  "ACTIVE": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "COMPLETED": "bg-slate-100 text-slate-600 border-slate-200",
  "CANCELLED": "bg-red-100 text-red-700 border-red-200",
  "LOST_CARD_PENDING": "bg-orange-100 text-orange-700 border-orange-200",
  "MISMATCH_PENDING": "bg-yellow-100 text-yellow-700 border-yellow-200"
};

const PAYMENT_STATUS_BADGE = {
  "PENDING": "bg-orange-100 text-orange-700 border-orange-200",
  "PAID": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "WAIVED": "bg-slate-100 text-slate-600 border-slate-200"
};

function formatVND(amount) { 
  if (amount === undefined || amount === null) return "-";
  return Number(amount).toLocaleString("vi-VN") + "đ"; 
}

export default function SessionsAdministrationPage() {
  const [sessions, setSessions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCustomerType, setFilterCustomerType] = useState("ALL");
  const [filterVehicleType, setFilterVehicleType] = useState("ALL");

  const [selectedSession, setSelectedSession] = useState(null);

  // Dialog Action
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");
  const [newSlotId, setNewSlotId] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterStatus !== "ALL") params.status = filterStatus;
      if (filterCustomerType !== "ALL") params.customerType = filterCustomerType;
      if (filterVehicleType !== "ALL") params.vehicleTypeId = filterVehicleType;
      if (filterSearch) params.keyword = filterSearch;
      
      const [sessionData, slotData, vTypes] = await Promise.all([
        adminSessionService.getSessions(params),
        parkingService.getSlots(),
        parkingService.getVehicleTypes()
      ]);
      setSessions(sessionData || []);
      setSlots(slotData || []);
      setVehicleTypes(vTypes || []);
    } catch (error) {
      toast.error(error.message || "Không tải được dữ liệu phiên.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setFilterSearch("");
    setFilterStatus("ALL");
    setFilterCustomerType("ALL");
    setFilterVehicleType("ALL");
    loadData();
  }

  const availableSlots = slots.filter((slot) => slot.status === "AVAILABLE");

  const openActionDialog = (session, act) => {
    setSelectedSession(session);
    setAction(act);
    setReason("");
    setNewSlotId("");
  };

  const closeDialog = () => {
    setAction(null);
    setReason("");
    setNewSlotId("");
  };

  const submitAction = async () => {
    if (!selectedSession || !action) return;
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do.");
      return;
    }

    try {

      if (action === "cancel") {
        await adminSessionService.cancel(selectedSession.id, { reason });
      }
      if (action === "moveSlot") {
        if (!newSlotId) {
          toast.error("Vui lòng chọn slot mới.");
          return;
        }
        await adminSessionService.moveSlot(selectedSession.id, { reason, newSlotId });
      }
      toast.success("Thao tác thành công.");
      closeDialog();
      await loadData();
      setSelectedSession(null); 
    } catch (error) {
      toast.error(error.message || "Không thể thực hiện thao tác.");
    }
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-col flex-1 gap-4 transition-all duration-300">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Phiên Gửi Xe</h2>
          <p className="text-sm text-slate-500 mt-1">Tra cứu, theo dõi và xử lý các phiên gửi xe đang hoạt động hoặc phát sinh sự cố.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Tìm mã phiên, thẻ, biển số..." 
              className="pl-9 bg-slate-50"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-medium">Trạng thái</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] bg-slate-50">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                <SelectItem value="LOST_CARD_PENDING">LOST_CARD_PENDING</SelectItem>
                <SelectItem value="MISMATCH_PENDING">MISMATCH_PENDING</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-medium">Loại khách</span>
            <Select value={filterCustomerType} onValueChange={setFilterCustomerType}>
              <SelectTrigger className="w-[120px] bg-slate-50">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="CASUAL">Vãng lai</SelectItem>
                <SelectItem value="MONTHLY">Vé tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-medium">Loại xe</span>
            <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
              <SelectTrigger className="w-[120px] bg-slate-50">
                <SelectValue placeholder="Tất cả loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {vehicleTypes.map(vt => (
                  <SelectItem key={vt.id} value={String(vt.id)}>{vt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 mt-5 ml-auto" onClick={loadData} disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" /> Tìm kiếm
          </Button>
          <Button variant="outline" className="mt-5" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Mã phiên</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Mã thẻ</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Biển số</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Loại xe</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Khách</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Vị trí đỗ</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap text-center">Thời gian vào</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap text-center">Trạng thái phiên</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap text-center">Thanh toán</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-10 text-slate-500">Đang tải dữ liệu...</TableCell></TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-10 text-slate-500">Không tìm thấy phiên gửi nào</TableCell></TableRow>
                ) : (
                  sessions.map(session => (
                    <TableRow 
                      key={session.id} 
                      className={`hover:bg-slate-50 cursor-pointer ${selectedSession?.id === session.id && !action ? "bg-blue-50/50" : ""}`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <TableCell className="font-medium text-blue-600">{session.sessionCode}</TableCell>
                      <TableCell>{session.card?.code || session.cardCode || "-"}</TableCell>
                      <TableCell className="font-mono">{session.noPlate ? "Không biển" : (session.plateNumber || "-")}</TableCell>
                      <TableCell>{session.vehicleType?.name || session.vehicleTypeName}</TableCell>
                      <TableCell>{session.customerType === "MONTHLY" ? "Vé tháng" : "Vãng lai"}</TableCell>
                      <TableCell>
                         {session.floor?.code || session.floorCode || "-"} - {session.area?.code || session.areaCode || "-"} - {session.slot?.code || session.slotCode || "-"}
                      </TableCell>
                      <TableCell className="text-center text-sm">{formatDateTime(session.entryTime)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${STATUS_BADGE[session.status] || STATUS_BADGE.ACTIVE}`}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${PAYMENT_STATUS_BADGE[session.paymentStatus] || PAYMENT_STATUS_BADGE.PENDING}`}>
                          {session.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => setSelectedSession(session)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => openActionDialog(session, "moveSlot")} title="Chuyển slot">
                            <ArrowRightLeft className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => openActionDialog(session, "cancel")} title="Hủy phiên">
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <div>Tổng cộng {sessions.length} phiên</div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedSession && !action && (
        <div className="w-[400px] bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm flex-shrink-0 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Chi tiết phiên</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedSession(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto space-y-4 text-sm">
            <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded-md">
              <span className="text-slate-500 font-medium">Mã phiên</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-700">{selectedSession.sessionCode}</span>
                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${STATUS_BADGE[selectedSession.status] || STATUS_BADGE.ACTIVE}`}>
                  {selectedSession.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">Mã thẻ</span>
                <span className="font-semibold text-slate-900">{selectedSession.card?.code || selectedSession.cardCode || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">Biển số</span>
                <span className="font-semibold font-mono text-slate-900">{selectedSession.noPlate ? "Không biển số" : (selectedSession.plateNumber || "-")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">Loại xe</span>
                <span className="font-semibold text-slate-900">{selectedSession.vehicleType?.name || selectedSession.vehicleTypeName || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">Loại khách</span>
                <span className="font-semibold text-slate-900">{selectedSession.customerType === "MONTHLY" ? "Vé tháng" : "Vãng lai"}</span>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Cổng vào / Cổng ra</span>
                <span className="font-medium text-slate-900">
                  {selectedSession.entryGate?.name || "-"} / {selectedSession.exitGate?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian vào</span>
                <span className="font-medium text-slate-900">{formatDateTime(selectedSession.entryTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian ra</span>
                <span className="font-medium text-slate-900">{selectedSession.exitTime ? formatDateTime(selectedSession.exitTime) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tầng / Khu vực / Slot</span>
                <span className="font-medium text-slate-900">
                   {selectedSession.floor?.code || selectedSession.floorCode || "-"} / {selectedSession.area?.code || selectedSession.areaCode || "-"} / {selectedSession.slot?.code || selectedSession.slotCode || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nhân viên vào/ra (ID)</span>
                <span className="font-medium text-slate-900">
                  {selectedSession.entryStaffId || "-"} / {selectedSession.exitStaffId || "-"}
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-700">Snapshot giá (khi vào)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Giá ngày</span>
                <span className="font-medium">{formatVND(selectedSession.snapshotDayPrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Giá đêm</span>
                <span className="font-medium">{formatVND(selectedSession.snapshotNightPrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Giá vé tháng</span>
                <span className="font-medium">{formatVND(selectedSession.snapshotMonthlyPrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Phí mất thẻ</span>
                <span className="font-medium">{formatVND(selectedSession.snapshotLostCardFee)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Trạng thái thanh toán</span>
                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${PAYMENT_STATUS_BADGE[selectedSession.paymentStatus] || PAYMENT_STATUS_BADGE.PENDING}`}>
                  {selectedSession.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bắt buộc thanh toán</span>
                <span className="font-medium">{selectedSession.paymentRequired ? "Có" : "Không (Vé tháng)"}</span>
              </div>
            </div>

            {(selectedSession.suggestedSlotId || selectedSession.overrideSlotId || selectedSession.cancellationReason) && (
              <>
                <div className="w-full h-px bg-slate-100" />
                <div className="space-y-2 text-xs">
                  {selectedSession.suggestedSlotId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Slot đề xuất (ID)</span>
                      <span className="font-medium">{selectedSession.suggestedSlotId}</span>
                    </div>
                  )}
                  {selectedSession.overrideSlotId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Slot Override (ID)</span>
                      <span className="font-medium">{selectedSession.overrideSlotId}</span>
                    </div>
                  )}
                  {selectedSession.overrideReason && (
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Lý do Override</span>
                      <span className="bg-slate-50 p-2 rounded text-slate-700">{selectedSession.overrideReason}</span>
                    </div>
                  )}
                  {selectedSession.cancellationReason && (
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Lý do Hủy</span>
                      <span className="bg-red-50 text-red-700 p-2 rounded">{selectedSession.cancellationReason}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Thao tác quản trị</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full justify-center bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" onClick={() => openActionDialog(selectedSession, "moveSlot")}>
                <ArrowRightLeft className="w-4 h-4 mr-2" /> Chuyển slot
              </Button>
              <Button variant="outline" className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-white" onClick={() => openActionDialog(selectedSession, "cancel")}>
                <Ban className="w-4 h-4 mr-2" /> Hủy phiên
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "moveSlot" ? "Điều chuyển slot thủ công" : "Hủy phiên"}
            </DialogTitle>
            <DialogDescription>
              {action === "moveSlot" ? "Chuyển xe sang slot AVAILABLE khi cảm biến hoặc slot gặp lỗi." : 
               "Chuyển phiên sang CANCELLED để giải phóng vận hành."}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="rounded-lg border bg-slate-50 p-3 text-sm">
              <div className="font-mono font-black">{selectedSession.sessionCode}</div>
              <div className="mt-1 text-slate-500">{selectedSession.card?.code || selectedSession.cardCode} / {selectedSession.plateNumber || "Không biển"}</div>
            </div>
          )}

          <div className="space-y-4 py-2">
            {action === "moveSlot" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Slot mới <span className="text-red-500">*</span></label>
                <Select value={newSlotId} onValueChange={setNewSlotId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn slot AVAILABLE" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.length === 0 && <SelectItem value="none" disabled>Không có slot trống</SelectItem>}
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={String(slot.id)}>
                        {slot.floorCode || slot.floor?.code} / {slot.areaCode || slot.area?.code} / {slot.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Lý do can thiệp <span className="text-red-500">*</span></label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do bắt buộc..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Hủy</Button>
            <Button onClick={submitAction} className="bg-blue-600 hover:bg-blue-700">Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
