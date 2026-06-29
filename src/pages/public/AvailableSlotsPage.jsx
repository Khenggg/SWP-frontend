import React, { useState, useEffect } from "react";
import { parkingService } from "@/services/parkingService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AreaDensityGauge({ area }) {
  const maxCap = area.maxCapacity || area.totalSlots || 0;
  const current = area.currentCount !== undefined ? area.currentCount : (maxCap - (area.availableSlots || 0));
  const percent = maxCap > 0 ? Math.round((current / maxCap) * 100) : 0;
  const available = maxCap - current;

  let statusLabel = "Thông thoáng";
  let colorClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
  let textColorClass = "text-emerald-600";
  let borderColorClass = "border-emerald-100 bg-white hover:border-emerald-200";

  if (percent >= 90) {
    statusLabel = "Đầy chỗ";
    colorClass = "bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.4)]";
    textColorClass = "text-rose-600 font-bold";
    borderColorClass = "border-rose-100 bg-white hover:border-rose-200";
  } else if (percent >= 75) {
    statusLabel = "Khá đông";
    colorClass = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
    textColorClass = "text-amber-600";
    borderColorClass = "border-amber-100 bg-white hover:border-amber-200";
  }

  return (
    <Card className={`p-5 rounded-xl border shadow-sm transition-all duration-300 ${borderColorClass}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-mono text-xs font-black text-slate-400 block">{area.code}</span>
          <h4 className="font-bold text-slate-800 text-sm mt-0.5">{area.name}</h4>
        </div>
        <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border-0 ${
          percent >= 90 ? "bg-red-50 text-red-700" : percent >= 75 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
        }`}>
          {statusLabel}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>Mật độ bao phủ:</span>
          <span className={textColorClass}>{percent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
          <div
            className={`h-full transition-all duration-500 rounded-full ${colorClass}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
          <span>Đang đỗ: {current}/{maxCap} xe</span>
          <span>Còn trống: {available} chỗ</span>
        </div>
      </div>
    </Card>
  );
}

export default function AvailableSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [areas, setAreas] = useState([]);
  const [floors, setFloors] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parkingService.getAvailableSlots();
      setSlots(data.slots || []);
      setAreas(data.areas || []);
      setFloors(data.floors || []);
      setVehicleTypes(data.vehicleTypes || []);
    } catch (e) {
      console.error(e);
      setError("Không tải được dữ liệu bãi xe. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filter for Slots (Only B2 - Ô Tô)
  const filteredSlots = slots.filter((s) => {
    const matchVehicle = filterVehicle === "ALL" || s.vehicleTypeName === filterVehicle;
    const matchFloor = filterFloor === "ALL" || s.floorCode === filterFloor;
    return matchVehicle && matchFloor;
  });

  const availableCount = filteredSlots.filter((s) => s.status === "AVAILABLE").length;
  const totalCount = filteredSlots.length;

  const vehicleOptions = ["ALL", ...vehicleTypes.map((v) => v.name)];
  const floorOptions = ["ALL", ...floors.map((f) => f.code)];

  // Motorbike calculations (B1)
  const mbAreas = areas.filter((a) => a.floorCode === "B1");
  const mbTotalCapacity = mbAreas.reduce((sum, a) => sum + a.maxCapacity, 0);
  const mbTotalCurrent = mbAreas.reduce((sum, a) => sum + a.currentCount, 0);
  const mbPercent = mbTotalCapacity > 0 ? Math.round((mbTotalCurrent / mbTotalCapacity) * 100) : 0;

  // Transport calculations (B3)
  const tsAreas = areas.filter((a) => a.floorCode === "B3");
  const tsTotalCapacity = tsAreas.reduce((sum, a) => sum + a.maxCapacity, 0);
  const tsTotalCurrent = tsAreas.reduce((sum, a) => sum + a.currentCount, 0);
  const tsPercent = tsTotalCapacity > 0 ? Math.round((tsTotalCurrent / tsTotalCapacity) * 100) : 0;

  // Car calculations (B2)
  const carAreas = areas.filter((a) => a.floorCode === "B2");
  const carTotalCapacity = carAreas.reduce((sum, a) => sum + (a.maxCapacity || a.totalSlots || 0), 0);
  const carTotalCurrent = carAreas.reduce((sum, a) => sum + (a.currentCount !== undefined ? a.currentCount : ((a.maxCapacity || a.totalSlots) - (a.availableSlots || 0))), 0);
  const carPercent = carTotalCapacity > 0 ? Math.round((carTotalCurrent / carTotalCapacity) * 100) : 0;

  // Mismatch Error logic
  let infoMessage = null;

  if (filterVehicle === "Xe Máy" && (filterFloor === "B2" || filterFloor === "B3")) {
    infoMessage = {
      type: "error",
      title: "Vị trí không phù hợp",
      desc: `Xe Máy chỉ đỗ tại Tầng B1. Vui lòng chuyển bộ lọc sang Tầng B1 để xem thông tin mật độ.`,
    };
  } else if (filterVehicle === "Ô Tô" && (filterFloor === "B1" || filterFloor === "B3")) {
    infoMessage = {
      type: "error",
      title: "Vị trí không phù hợp",
      desc: `Xe Ô Tô chỉ đỗ tại Tầng B2. Vui lòng chuyển bộ lọc sang Tầng B2 để xem thông tin mật độ.`,
    };
  } else if (filterVehicle === "Xe Vận Chuyển" && (filterFloor === "B1" || filterFloor === "B2")) {
    infoMessage = {
      type: "error",
      title: "Vị trí không phù hợp",
      desc: `Xe Vận Chuyển chỉ đỗ tại Tầng B3. Vui lòng chuyển bộ lọc sang Tầng B3 để xem thông tin mật độ.`,
    };
  }

  // Section visibility flags
  const showB1 = !infoMessage && (filterFloor === "ALL" || filterFloor === "B1") && (filterVehicle === "ALL" || filterVehicle === "Xe Máy");
  const showB2 = !infoMessage && (filterFloor === "ALL" || filterFloor === "B2") && (filterVehicle === "ALL" || filterVehicle === "Ô Tô");
  const showB3 = !infoMessage && (filterFloor === "ALL" || filterFloor === "B3") && (filterVehicle === "ALL" || filterVehicle === "Xe Vận Chuyển");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-black mb-2">Thông Tin Mật Độ Bãi Đỗ Xe</h1>
          <p className="text-indigo-200 text-sm">
            Giám sát mật độ bao phủ chi tiết theo từng khu vực đối với Xe Máy (Tầng B1), Xe Ô Tô (Tầng B2) và Xe Vận Chuyển (Tầng B3). Toàn bộ slot đỗ được quản lý nội bộ bởi hệ thống.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-teal-200 bg-teal-50/50 p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-teal-700">
              {mbPercent}%
              <span className="text-xs font-normal text-teal-500 ml-1">độ phủ</span>
            </p>
            <p className="text-xs text-teal-600 font-bold mt-1">Mật Độ Xe Máy (Tầng B1)</p>
          </Card>
          <Card className="border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-emerald-700">
              {carPercent}%
              <span className="text-xs font-normal text-emerald-500 ml-1">độ phủ</span>
            </p>
            <p className="text-xs text-emerald-600 font-bold mt-1">Mật Độ Ô Tô (Tầng B2)</p>
          </Card>
          <Card className="border border-amber-200 bg-amber-50/50 p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-amber-700">
              {tsPercent}%
              <span className="text-xs font-normal text-amber-500 ml-1">độ phủ</span>
            </p>
            <p className="text-xs text-amber-600 font-bold mt-1">Mật Độ Xe Vận Chuyển (Tầng B3)</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-500 uppercase">Loại xe:</span>
            {vehicleOptions.map((v) => (
              <Button
                key={v}
                onClick={() => setFilterVehicle(v)}
                variant={filterVehicle === v ? "default" : "outline"}
                className={`rounded-full px-3 h-7 text-xs font-bold transition-all ${
                  filterVehicle === v
                    ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white"
                    : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                }`}
              >
                {v === "ALL" ? "Tất cả" : v}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap md:ml-auto">
            <span className="text-xs font-black text-slate-500 uppercase">Tầng:</span>
            {floorOptions.map((f) => (
              <Button
                key={f}
                onClick={() => setFilterFloor(f)}
                variant={filterFloor === f ? "default" : "outline"}
                className={`rounded-full px-3 h-7 text-xs font-bold transition-all ${
                  filterFloor === f
                    ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white"
                    : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                }`}
              >
                {f === "ALL" ? "Tất cả" : f}
              </Button>
            ))}
          </div>
        </div>

        {/* Display Area */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 space-y-3 shadow-sm animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded" />)}
            </div>
          ) : error ? (
            <Card className="border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-red-500 text-sm font-semibold mb-3">⚠ {error}</p>
              <Button onClick={load} variant="link" className="text-sm font-bold text-indigo-600 underline p-0 h-auto">Thử lại</Button>
            </Card>
          ) : infoMessage ? (
            <Card className="border-red-200 bg-red-50/50 p-8 text-center text-red-800">
              <span className="text-4xl block mb-3">❌</span>
              <h3 className="text-base font-bold uppercase tracking-wide mb-2">{infoMessage.title}</h3>
              <p className="text-sm opacity-90 max-w-lg mx-auto leading-relaxed">{infoMessage.desc}</p>
            </Card>
          ) : (
            <>
              {/* Tầng B1 - Xe Máy */}
              {showB1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-teal-500 pl-3">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                      Tầng B1 - Bãi Xe Máy
                    </h2>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-800 border-0 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Mật độ: {mbPercent}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Khu vực xe máy được phân chia thành các khu chức năng và giám sát độ phủ bao phủ. Khách hàng lựa chọn khu vực còn thông thoáng để đỗ xe.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mbAreas.map((area) => (
                      <AreaDensityGauge key={area.id} area={area} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tầng B2 - Xe Ô Tô */}
              {showB2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                      Tầng B2 - Bãi Xe Ô Tô
                    </h2>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Mật độ: {carPercent}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Khu vực đỗ xe ô tô được phân chia thành các khu vực chức năng. Hệ thống tự động phân phối và khóa cứng slot đỗ nội bộ khi bạn đặt chỗ trước.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {carAreas.map((area) => (
                      <AreaDensityGauge key={area.id} area={area} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tầng B3 - Xe Vận Chuyển */}
              {showB3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                      Tầng B3 - Khu Xe Vận Chuyển
                    </h2>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Mật độ: {tsPercent}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Khu vực xe vận tải, xe giao hàng tải trọng lớn. Được giám sát mật độ bao phủ theo từng khu để phân luồng hợp lý.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tsAreas.map((area) => (
                      <AreaDensityGauge key={area.id} area={area} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
