import React, { useState, useEffect } from "react";
import { History, Layers, Tag, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { bookingService } from "../../services/bookingService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BOOKING_STATUS } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import LicensePlate from "@/components/ui/license-plate";
import EmptyState from "@/components/ui/empty-state";

// Helper for rendering date format
const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function DriverHistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [username, setUsername] = useState(() => {
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.username || "";
      } catch (e) {
        console.error("Lỗi đọc user", e);
      }
    }
    return "";
  });

  useEffect(() => {
    // 1. Get logged in driver details
    const savedUser = sessionStorage.getItem("currentUser");
    let currentUsername = "";
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        currentUsername = parsed.username || "";
        setUsername(currentUsername);
      } catch (e) {
        console.error("Lỗi đọc user", e);
      }
    }

    const fetchHistory = async () => {
      try {
        const history = await bookingService.getHistory();
        setHistoryList(history);
      } catch (e) {
        console.error("Lỗi lấy lịch sử gửi xe:", e);
      }
    };
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử gửi xe trên trình duyệt?")) {
      try {
        await bookingService.clearHistory();
        setHistoryList([]);
      } catch (e) {
        console.error("Lỗi xóa lịch sử:", e);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case BOOKING_STATUS.COMPLETED:
        return (
          <Badge variant="outline" className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Thành Công
          </Badge>
        );
      case BOOKING_STATUS.CANCELLED:
        return (
          <Badge variant="outline" className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800">
            <XCircle className="w-3.5 h-3.5" /> Đã Hủy (Không hoàn phí)
          </Badge>
        );
      case BOOKING_STATUS.EXPIRED_CHECKIN:
        return (
          <Badge variant="outline" className="flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-rose-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <AlertCircle className="w-3.5 h-3.5" /> Quá hạn Check-in
          </Badge>
        );
      case BOOKING_STATUS.EXPIRED_TIMEOUT:
        return (
          <Badge variant="outline" className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Hết Hạn Thanh Toán
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Lịch Sử Gửi Xe
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Xem lịch sử chi tiết các phiên đỗ xe và đặt chỗ trước đó của bạn
          </p>
        </div>
        {historyList.length > 0 && (
          <Button 
            onClick={handleClearHistory}
            variant="destructive"
            className="text-xs font-bold"
          >
            Xóa Lịch Sử
          </Button>
        )}
      </div>

      {/* History List */}
      {historyList.length === 0 ? (
        <EmptyState 
          icon="⏱️"
          title="Chưa ghi nhận lịch sử gửi xe nào"
          description="Thực hiện đặt chỗ và hoàn tất phiên gửi xe để hiển thị lịch sử đỗ xe ở đây."
          className="animate-fadeIn"
        />
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <TableHead className="py-4.5 px-6">Mã Đặt Chỗ / Loại Xe</TableHead>
                <TableHead className="py-4.5 px-6">Biển Số Xe</TableHead>
                <TableHead className="py-4.5 px-6">Khu Vực Gửi Xe</TableHead>
                <TableHead className="py-4.5 px-6">Thời Gian Gửi Xe (Check-in/out)</TableHead>
                <TableHead className="py-4.5 px-6 text-right">Phí Đặt Chỗ (Hạn giữ)</TableHead>
                <TableHead className="py-4.5 px-6 text-right">Phí Gửi Xe (Thời gian đỗ)</TableHead>
                <TableHead className="py-4.5 px-6 text-center">Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {historyList.map((session) => (
                <TableRow key={session.id} className="hover:bg-slate-50/50 transition">
                  {/* ID & Vehicle Type */}
                  <TableCell className="py-4 px-6">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800">{session.id}</span>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">
                        {session.vehicleTypeName}
                      </span>
                    </div>
                  </TableCell>

                  {/* License Plate */}
                  <TableCell className="py-4 px-6">
                    <LicensePlate plate={session.plate} size="md" />
                  </TableCell>

                  {/* Area Name / Slot Code */}
                  <TableCell className="py-4 px-6">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-800">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-extrabold">{session.areaName || `Khu ${session.areaCode}`}</span>
                      </div>
                      {session.slotCode && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          (Nội bộ: {session.slotCode})
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Date Time Check-in/out */}
                  <TableCell className="py-4 px-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-7">Vào:</span>
                      <span className="text-slate-700 font-bold">{formatDateTime(session.checkInTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-7">Ra:</span>
                      <span className="text-slate-700 font-bold">{formatDateTime(session.checkOutTime)}</span>
                    </div>
                  </TableCell>

                  {/* Reservation Fee (Hạn giữ) */}
                  <TableCell className="py-4 px-6 text-right">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700 block">{session.hours} giờ giữ</span>
                      <span className="font-black text-amber-600">
                        {((session.reservationFee !== undefined ? session.reservationFee : session.fee) || 0).toLocaleString()} VND
                      </span>
                    </div>
                  </TableCell>

                  {/* Actual Parking Fee (Thời gian đỗ) */}
                  <TableCell className="py-4 px-6 text-right">
                    {session.status === BOOKING_STATUS.COMPLETED ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 block">{(session.actualHours || 0)} giờ đỗ</span>
                        <span className="font-black text-indigo-600">
                          {((session.actualParkingFee || 0)).toLocaleString()} VND
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium italic">Không đỗ xe</span>
                    )}
                  </TableCell>

                  {/* Status badge */}
                  <TableCell className="py-4 px-6 text-center">
                    {getStatusBadge(session.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4.5 text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>Biển số xe được ghi nhận trực tiếp thông qua hệ thống cảm biến check-in/out của từng phiên gửi xe của tài xế.</span>
          </div>
        </Card>
      )}
    </div>
  );
}
