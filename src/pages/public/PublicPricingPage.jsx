import React, { useState, useEffect } from "react";
import { pricingService } from "@/services/pricingService";
import { DollarSign, Moon, Sun, CreditCard, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";

function formatVND(amount) {
  if (!amount && amount !== 0) return "–";
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
      
      // Lấy danh sách loại xe duy nhất từ dữ liệu bảng giá trả về
      const uniqueTypes = Array.from(new Set(data.map(r => r.vehicleTypeName))).filter(Boolean);
      setVehicleTypes(uniqueTypes);
    } catch {
      setError("Không tải được thông tin bảng giá. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Backend returns only ACTIVE rules
  const displayed = filterVehicle === "ALL"
    ? rules
    : rules.filter((r) => r.vehicleTypeName === filterVehicle);

  const vehicleOptions = ["ALL", ...vehicleTypes];

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Bảng Giá Gửi Xe</h1>
          </div>
          <p className="text-gray-500 text-sm ml-13 pl-0.5">
            Áp dụng từ 01/01/2026. Giá đã bao gồm thuế suất hiện hành.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filter */}
        <Card className="shadow-sm p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loại xe:</span>
          <div className="flex flex-wrap gap-2">
            {vehicleOptions.map((v) => (
              <Button
                key={v}
                variant={filterVehicle === v ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterVehicle(v)}
                className={`rounded-full ${filterVehicle === v ? "bg-blue-600 hover:bg-blue-700" : "hover:text-blue-600 hover:border-blue-400"}`}
              >
                {v === "ALL" ? "Tất cả" : v}
              </Button>
            ))}
          </div>
        </Card>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200 p-10 text-center shadow-none">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm font-semibold mb-3">{error}</p>
            <Button variant="destructive" onClick={load}>
              Thử lại
            </Button>
          </Card>
        ) : displayed.length === 0 ? (
          <EmptyState 
            icon={<DollarSign size={40} className="text-gray-300" />} 
            title="Chưa có bảng giá" 
            description="Không tìm thấy thông tin cho loại xe này." 
            className="border-gray-100"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((rule) => (
              <Card
                key={rule.pricingRuleId ?? rule.id}
                className="shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-blue-600 px-6 py-4">
                  <h3 className="text-base font-black text-white uppercase tracking-wide">{rule.vehicleTypeName}</h3>
                </div>

                {/* Card Body */}
                <CardContent className="p-5 space-y-3">
                  {/* Monthly Highlight */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CreditCard size={13} className="text-blue-500" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Vé Tháng</span>
                    </div>
                    <p className="text-2xl font-black text-blue-700">
                      {formatVND(rule.monthlyPrice)}
                      <span className="text-xs font-normal text-gray-400 ml-1">/ tháng</span>
                    </p>
                  </div>

                  {/* Day / Night */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Sun size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Ban Ngày</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{formatVND(rule.dayPrice)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Moon size={12} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Ban Đêm</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{formatVND(rule.nightPrice)}</p>
                    </div>
                  </div>

                  {/* Lost Card Fee */}
                  <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-semibold text-red-600">Phí mất thẻ</span>
                    <span className="text-sm font-black text-red-700">{formatVND(rule.lostCardFee)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 items-start text-sm text-yellow-800">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p>
            Giá ban ngày áp dụng <strong>06:00 – 22:00</strong> | Giá ban đêm áp dụng <strong>22:00 – 06:00</strong>.
            Phí gửi giờ tính theo từng giờ lẻ làm tròn. Bảng giá có thể thay đổi mà không cần thông báo trước.
          </p>
        </div>
      </div>
    </div>
  );
}
