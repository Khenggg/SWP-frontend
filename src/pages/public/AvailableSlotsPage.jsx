import React, { useState, useEffect } from "react";
import { parkingService } from "@/services/parkingService";
import { CarFront, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Slot Chip ────────────────────────────────────────────────────────────────
function SlotChip({ code }) {
  return (
    <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-green-700">
      <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
      {code}
    </div>
  );
}

// ─── Area Section ─────────────────────────────────────────────────────────────
function AreaSection({ areaCode, areaName, vehicleTypeName, slots }) {
  return (
    <Card className="overflow-hidden shadow-sm">
      {/* Area Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{areaCode}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-sm font-bold text-gray-700">{areaName}</span>
          {vehicleTypeName && (
            <Badge className="ml-1 px-2 py-0.5 font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100">
              {vehicleTypeName}
            </Badge>
          )}
        </div>
        <Badge className="font-bold text-green-600 bg-green-50 border border-green-200 hover:bg-green-100">
          {slots.length} chỗ trống
        </Badge>
      </div>

      {/* Slot Grid */}
      <CardContent className="p-4">
        {slots.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2 italic">Không còn chỗ trống</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <SlotChip key={s.id} code={s.slotCode} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Floor Summary Card ───────────────────────────────────────────────────────
function FloorCard({ floorCode, floorName, count }) {
  return (
    <Card className="shadow-sm p-4 text-center">
      <p className="text-3xl font-black text-blue-600">{count}</p>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">{floorName}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">chỗ trống</p>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AvailableSlotsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [slots, setSlots]         = useState([]);
  const [areas, setAreas]         = useState([]);
  const [floors, setFloors]       = useState([]);
  const [filterFloor, setFilterFloor] = useState("ALL");

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parkingService.getAvailableSlots();
      setSlots(data.slots   || []);
      setAreas(data.areas   || []);
      setFloors(data.floors || []);
    } catch {
      setError("Không tải được dữ liệu bãi xe. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filter areas by floor
  const filteredAreas = filterFloor === "ALL"
    ? areas
    : areas.filter((a) => a.floorCode === filterFloor);

  // Count slots per floor for summary
  const floorCounts = floors.reduce((acc, f) => {
    acc[f.code] = slots.filter((s) => {
      const parts = (s.slotCode || "").split("-");
      const fc    = s.floorCode || parts[0] || "";
      return fc === f.code;
    }).length;
    return acc;
  }, {});

  const totalAvailable = slots.length;

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CarFront size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Chỗ Trống Hiện Tại</h1>
            {!isLoading && !error && (
              <Badge className="ml-2 px-3 py-1 bg-green-100 text-green-700 border border-green-200 font-bold hover:bg-green-200">
                {totalAvailable} chỗ trống
              </Badge>
            )}
          </div>
          <p className="text-gray-500 text-sm">Danh sách các vị trí đỗ xe còn trống theo thời gian thực.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Floor Summary */}
        {!isLoading && !error && floors.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {floors.map((f) => (
              <FloorCard
                key={f.code}
                floorCode={f.code}
                floorName={f.name}
                count={floorCounts[f.code] ?? 0}
              />
            ))}
          </div>
        )}

        {/* Filter Bar */}
        <Card className="shadow-sm p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tầng:</span>
          <Button
            variant={filterFloor === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterFloor("ALL")}
            className={`rounded-full ${filterFloor === "ALL" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            Tất cả
          </Button>
          {floors.map((f) => (
            <Button
              key={f.code}
              variant={filterFloor === f.code ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterFloor(f.code)}
              className={`rounded-full ${filterFloor === f.code ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            >
              {f.code}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            className="ml-auto text-gray-400 hover:text-blue-600"
          >
            <RefreshCw size={13} className="mr-1.5" /> Làm mới
          </Button>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200 p-10 text-center shadow-none">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm font-semibold mb-3">{error}</p>
            <Button variant="destructive" onClick={load}>
              Thử lại
            </Button>
          </Card>
        ) : filteredAreas.length === 0 ? (
          <Card className="p-16 text-center shadow-none border-gray-100">
            <CarFront size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-600">Không có chỗ trống</p>
            <p className="text-sm text-gray-400 mt-1">Không còn vị trí trống cho bộ lọc này.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAreas.map((area) => {
              const areaSlots = slots.filter((s) => {
                const parts   = (s.slotCode || "").split("-");
                const ac      = s.areaCode || (parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "");
                return ac === area.code;
              });
              return (
                <AreaSection
                  key={area.code}
                  areaCode={area.code}
                  areaName={area.name}
                  vehicleTypeName={area.vehicleTypeName}
                  slots={areaSlots}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
