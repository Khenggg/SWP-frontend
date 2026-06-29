import React, { useState, useEffect } from "react";
import { pricingService } from "@/services/pricingService";
import { parkingService } from "@/services/parkingService";
import { Button } from "@/components/ui/button";
import { COMMON_STATUS } from "@/constants";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function formatVND(amount) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function PublicPricingPage() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pricingService.getPricingRules();
      setRules(data);
      const types = await parkingService.getVehicleTypes();
      setVehicleTypes(types);
    } catch {
      setError("Không tải được thông tin bảng giá. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeRules = rules.filter((r) => r.status === COMMON_STATUS.ACTIVE);
  const displayed = filterVehicle === "ALL"
    ? activeRules
    : activeRules.filter((r) => r.vehicleTypeName === filterVehicle);

  const vehicleOptions = ["ALL", ...vehicleTypes.map((v) => v.name)];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-black mb-2">Bảng Giá Gửi Xe</h1>
          <p className="text-emerald-200 text-sm">
            Giá hiển thị là giá đang áp dụng. Phí có thể thay đổi theo chính sách bãi.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Lọc theo loại xe:</span>
          {vehicleOptions.map((v) => (
            <Button
              key={v}
              onClick={() => setFilterVehicle(v)}
              variant={filterVehicle === v ? "default" : "outline"}
              className={`rounded-full px-4 text-xs font-bold transition-all ${
                filterVehicle === v
                  ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"
                  : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"
              }`}
            >
              {v === "ALL" ? "Tất cả" : v}
            </Button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-500 text-sm font-semibold mb-3">⚠ {error}</p>
              <Button onClick={load} variant="link" className="text-sm font-bold text-emerald-600 underline p-0 h-auto">Thử lại</Button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <p className="text-4xl mb-2">💰</p>
              <p className="font-semibold">Chưa có bảng giá cho loại xe này</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <TableHead className="px-5 py-3 text-left">Loại Xe</TableHead>
                  <TableHead className="px-5 py-3 text-right">Giá Ban Ngày</TableHead>
                  <TableHead className="px-5 py-3 text-right">Giá Ban Đêm</TableHead>
                  <TableHead className="px-5 py-3 text-right">Vé Tháng</TableHead>
                  <TableHead className="px-5 py-3 text-right">Phí Mất Thẻ</TableHead>
                  <TableHead className="px-5 py-3 text-center">Hiệu Lực Từ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {displayed.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-emerald-50 transition-colors">
                    <TableCell className="px-5 py-4 font-bold text-slate-800">{rule.vehicleTypeName}</TableCell>
                    <TableCell className="px-5 py-4 text-right font-semibold text-slate-700">{formatVND(rule.dayPrice)}</TableCell>
                    <TableCell className="px-5 py-4 text-right font-semibold text-slate-700">{formatVND(rule.nightPrice)}</TableCell>
                    <TableCell className="px-5 py-4 text-right font-bold text-emerald-700">{formatVND(rule.monthlyPrice)}</TableCell>
                    <TableCell className="px-5 py-4 text-right font-semibold text-red-600">{formatVND(rule.lostCardFee)}</TableCell>
                    <TableCell className="px-5 py-4 text-center text-slate-500">{rule.effectiveFrom}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Note */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 font-semibold dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30">
          ⚠️ Giá ban ngày áp dụng 06:00 – 22:00 | Giá ban đêm áp dụng 22:00 – 06:00.
          Phí tính theo từng giờ lẻ làm tròn. Bảng giá có thể thay đổi không báo trước.
        </div>
      </div>
    </div>
  );
}
