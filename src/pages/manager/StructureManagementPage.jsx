import React, { useState, useEffect } from "react";
import { parkingService } from "../../services/parkingService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMMON_STATUS, SLOT_STATUS } from "@/constants";
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
import { Layers, Map, Grid, Plus, Edit2, AlertTriangle, CheckCircle, Car, Wrench, X, AlertCircle } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import StructureStatCards from "../../components/manager/structure/StructureStatCards";
import FloorModal from "../../components/manager/structure/FloorModal";
import AreaModal from "../../components/manager/structure/AreaModal";
import SlotModal from "../../components/manager/structure/SlotModal";
import SlotDetailSidebar from "../../components/manager/structure/SlotDetailSidebar";


// Constants & Mappings
const AREA_STATUS_BADGE = {
  [COMMON_STATUS.ACTIVE]: "text-emerald-600 bg-emerald-50",
  [SLOT_STATUS.LOCKED]: "text-red-600 bg-red-50",
  [SLOT_STATUS.MAINTENANCE]: "text-amber-600 bg-amber-50",
};

const SLOT_STATUS_COLORS = {
  [SLOT_STATUS.AVAILABLE]: "border-emerald-200 bg-emerald-50 text-emerald-700",
  [SLOT_STATUS.OCCUPIED]: "border-blue-300 bg-blue-50 text-blue-700",
  [SLOT_STATUS.LOCKED]: "border-red-200 bg-red-50 text-red-700",
  [SLOT_STATUS.MAINTENANCE]: "border-amber-200 bg-amber-50 text-amber-700",
};

const SLOT_STATUS_DOT = {
  [SLOT_STATUS.AVAILABLE]: "bg-emerald-500",
  [SLOT_STATUS.OCCUPIED]: "bg-blue-600",
  [SLOT_STATUS.LOCKED]: "bg-red-500",
  [SLOT_STATUS.MAINTENANCE]: "bg-amber-500",
};

const STATUS_LABELS = {
  [COMMON_STATUS.ACTIVE]: "ACTIVE",
  [SLOT_STATUS.LOCKED]: "LOCKED",
  [SLOT_STATUS.MAINTENANCE]: "MAINTENANCE",
  [SLOT_STATUS.AVAILABLE]: "AVAILABLE",
  [SLOT_STATUS.OCCUPIED]: "OCCUPIED",
};

export default function StructureManagementPage() {
  const [activeTab, setActiveTab] = useState("Tầng");
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStructure = async () => {
    setIsLoading(true);
    try {
      const [floorsData, areasData, slotsData, vTypes] = await Promise.all([
        parkingService.getFloors(),
        parkingService.getAreas(),
        parkingService.getSlots(),
        parkingService.getVehicleTypes(),
      ]);
      setFloors(floorsData || []);
      setAreas(areasData || []);
      setSlots(slotsData || []);
      setVehicleTypes(vTypes || []);
    } catch (e) {
      console.error("Lỗi tải thông tin cấu trúc bãi xe:", e);
      toast.error("Không thể tải thông tin cấu trúc.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  // Stats
  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === SLOT_STATUS.AVAILABLE).length;
  const occupiedSlots = slots.filter((s) => s.status === SLOT_STATUS.OCCUPIED).length;
  const maintenanceSlots = slots.filter((s) => s.status === SLOT_STATUS.MAINTENANCE || s.status === SLOT_STATUS.LOCKED).length;

  const percentAvailable = totalSlots ? ((availableSlots / totalSlots) * 100).toFixed(2) : 0;
  const percentOccupied = totalSlots ? ((occupiedSlots / totalSlots) * 100).toFixed(2) : 0;
  const percentMaintenance = totalSlots ? ((maintenanceSlots / totalSlots) * 100).toFixed(2) : 0;

  // Filters
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterArea, setFilterArea] = useState("ALL");
  const [filterVType, setFilterVType] = useState("ALL");
  const [filterSlotStatus, setFilterSlotStatus] = useState("ALL");

  // Modals state
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  // Slot Detail Sidebar State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  // --- ACTIONS ---
  const openCreateFloor = () => { setEditingItem(null); setForm({ floorCode: "", floorName: "", status: COMMON_STATUS.ACTIVE }); setShowFloorModal(true); };
  const openEditFloor = (floor) => { setEditingItem(floor); setForm({ floorCode: floor.code || floor.floorCode, floorName: floor.name || floor.floorName, status: floor.status }); setShowFloorModal(true); };
  const handleFloorSave = async () => {
    if (!form.floorCode || !form.floorName) return toast.error("Vui lòng điền đủ Mã tầng và Tên tầng");
    try {
      if (editingItem) await parkingService.updateFloor(editingItem.id, form);
      else await parkingService.addFloor(form);
      await fetchStructure();
      setShowFloorModal(false);
      toast.success("Lưu tầng thành công!");
    } catch (e) { toast.error(e.message || "Lỗi lưu tầng"); }
  };

  const openCreateArea = () => { setEditingItem(null); setForm({ floorId: "", areaCode: "", areaName: "", priorityOrder: 1, totalCapacity: 10, vehicleTypeIds: [] }); setShowAreaModal(true); };
  const openEditArea = (area) => { setEditingItem(area); setForm({ floorId: area.floorId || "", areaCode: area.code || area.areaCode, areaName: area.name || area.areaName, priorityOrder: area.priorityOrder || 1, totalCapacity: area.totalSlots || 10, vehicleTypeIds: area.vehicleTypeIds || [] }); setShowAreaModal(true); };
  const handleAreaSave = async () => {
    if (!form.areaCode || !form.areaName || !form.floorId) return toast.error("Vui lòng điền đủ Mã khu, Tên khu và chọn Tầng");
    try {
      if (editingItem) await parkingService.updateArea(editingItem.id, form);
      else await parkingService.addArea(form);
      await fetchStructure();
      setShowAreaModal(false);
      toast.success("Lưu khu vực thành công!");
    } catch (e) { toast.error(e.message || "Lỗi lưu khu vực"); }
  };

  const openCreateSlot = () => { setEditingItem(null); setForm({ areaId: "", slotCode: "", allowedVehicleTypeId: "" }); setShowSlotModal(true); };
  const handleSlotSave = async () => {
    if (!form.slotCode || !form.areaId || !form.allowedVehicleTypeId) return toast.error("Vui lòng điền đủ thông tin Slot");
    try {
      await parkingService.addSlot(form);
      await fetchStructure();
      setShowSlotModal(false);
      toast.success("Thêm slot thành công!");
    } catch (e) { toast.error(e.message || "Lỗi thêm slot"); }
  };

  const handleUpdateSlotStatus = async () => {
    if (!selectedSlot || !targetStatus) return;
    try {
      await parkingService.updateSlotStatus(selectedSlot.id, targetStatus);
      await fetchStructure();
      setSelectedSlot({ ...selectedSlot, status: targetStatus });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (e) { toast.error(e.message || "Lỗi cập nhật trạng thái"); }
  };

  // Filtered Data
  const filteredAreas = filterFloor === "ALL" ? areas : areas.filter((a) => a.floorCode === filterFloor || a.floorId === parseInt(filterFloor));
  const filteredSlots = slots.filter((s) => {
    const matchFloor = filterFloor === "ALL" || s.floorCode === filterFloor || s.floorId === parseInt(filterFloor);
    const matchArea = filterArea === "ALL" || s.areaCode === filterArea || s.areaId === parseInt(filterArea);
    const matchType = filterVType === "ALL" || s.vehicleTypeName === filterVType || s.allowedVehicleTypeId === parseInt(filterVType);
    const matchStatus = filterSlotStatus === "ALL" || s.status === filterSlotStatus;
    return matchFloor && matchArea && matchType && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-full overflow-hidden bg-[#f8fafc] min-h-screen p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Cấu trúc Bãi xe</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý tầng, khu vực và trạng thái các slot trong hệ thống bãi xe.</p>
      </div>

      {/* Stats Cards */}
      <StructureStatCards 
        floorsCount={floors.length}
        areasCount={areas.length}
        totalSlots={totalSlots}
        availableSlots={availableSlots}
        occupiedSlots={occupiedSlots}
        maintenanceSlots={maintenanceSlots}
        percentAvailable={percentAvailable}
        percentOccupied={percentOccupied}
        percentMaintenance={percentMaintenance}
      />

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 px-6">
          {["Tầng", "Khu vực", "Slot"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold text-sm transition-all border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === "Tầng" && <Layers className="w-4 h-4" />}
                {tab === "Khu vực" && <Map className="w-4 h-4" />}
                {tab === "Slot" && <Grid className="w-4 h-4" />}
                {tab}
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 flex flex-col">
          
          {/* TẦNG TAB */}
          {activeTab === "Tầng" && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Quản lý Tầng</h3>
                <Button onClick={openCreateFloor} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <Plus className="w-4 h-4 mr-2" /> Thêm tầng
                </Button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden flex-1">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-600 py-4">Mã tầng</TableHead>
                      <TableHead className="font-bold text-slate-600">Tên tầng</TableHead>
                      <TableHead className="font-bold text-slate-600">Trạng thái</TableHead>
                      <TableHead className="font-bold text-slate-600 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {floors.map((floor) => (
                      <TableRow key={floor.id}>
                        <TableCell className="font-semibold text-slate-800">{floor.code || floor.floorCode}</TableCell>
                        <TableCell className="text-slate-600">{floor.name || floor.floorName}</TableCell>
                        <TableCell>
                          <Badge className={`font-bold rounded-md px-2.5 py-1 ${AREA_STATUS_BADGE[floor.status] || "text-slate-600 bg-slate-100 hover:bg-slate-200"}`}>
                            {STATUS_LABELS[floor.status] || floor.status || "ACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditFloor(floor)} className="text-slate-400 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* KHU VỰC TAB */}
          {activeTab === "Khu vực" && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Quản lý Khu vực</h3>
                  <Select value={filterFloor} onValueChange={setFilterFloor}>
                    <SelectTrigger className="w-[180px] border-slate-200 h-9">
                      <SelectValue placeholder="Tất cả tầng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả tầng</SelectItem>
                      {floors.map((f) => <SelectItem key={f.id} value={f.code || f.id.toString()}>{f.code || f.floorCode}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={openCreateArea} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <Plus className="w-4 h-4 mr-2" /> Thêm khu vực
                </Button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden flex-1">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-600 py-4">Mã khu</TableHead>
                      <TableHead className="font-bold text-slate-600">Tên khu</TableHead>
                      <TableHead className="font-bold text-slate-600">Tầng</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center">Ưu tiên</TableHead>
                      <TableHead className="font-bold text-slate-600">Loại xe áp dụng</TableHead>
                      <TableHead className="font-bold text-slate-600 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAreas.map((area) => (
                      <TableRow key={area.id}>
                        <TableCell className="font-semibold text-slate-800">{area.code || area.areaCode}</TableCell>
                        <TableCell className="text-slate-600">{area.name || area.areaName}</TableCell>
                        <TableCell className="text-slate-600 font-medium">{area.floorCode}</TableCell>
                        <TableCell className="text-center text-slate-500">{area.priorityOrder || 1}</TableCell>
                        <TableCell>
                          <Badge className="px-2.5 py-1 font-semibold rounded-md bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100">
                            {area.vehicleTypeName || "Không rõ"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditArea(area)} className="text-slate-400 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* SLOT TAB */}
          {activeTab === "Slot" && (
            <div className="flex flex-1 gap-6 animate-in fade-in duration-300 min-h-0">
              {/* Left Panel: Slot Grid */}
              <div className="flex-1 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">Quản lý trạng thái Slot</h3>
                    <div className="flex gap-2 flex-wrap">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500">Tầng</span>
                        <Select value={filterFloor} onValueChange={setFilterFloor}>
                          <SelectTrigger className="w-[110px] h-8 text-xs border-slate-200 bg-white"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Tất cả</SelectItem>
                            {floors.map((f) => <SelectItem key={f.id} value={f.code || f.id.toString()}>{f.code || f.floorCode}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500">Khu vực</span>
                        <Select value={filterArea} onValueChange={setFilterArea}>
                          <SelectTrigger className="w-[110px] h-8 text-xs border-slate-200 bg-white"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Tất cả</SelectItem>
                            {areas.filter(a => filterFloor === "ALL" || a.floorCode === filterFloor || a.floorId === parseInt(filterFloor)).map((a) => <SelectItem key={a.id} value={a.code || a.id.toString()}>{a.code || a.areaCode}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500">Loại xe</span>
                        <Select value={filterVType} onValueChange={setFilterVType}>
                          <SelectTrigger className="w-[110px] h-8 text-xs border-slate-200 bg-white"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Tất cả</SelectItem>
                            {vehicleTypes.map((v) => <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500">Trạng thái</span>
                        <Select value={filterSlotStatus} onValueChange={setFilterSlotStatus}>
                          <SelectTrigger className="w-[120px] h-8 text-xs border-slate-200 bg-white"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Tất cả</SelectItem>
                            {Object.values(SLOT_STATUS).map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button onClick={openCreateSlot} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg self-end mb-1">
                    <Plus className="w-4 h-4 mr-1" /> Thêm Slot
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex gap-4 p-3 border-b border-slate-100 bg-white items-center justify-center text-[11px] font-bold tracking-wider text-slate-600">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-emerald-300 rounded-sm bg-emerald-50"></div> AVAILABLE</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-blue-400 rounded-sm bg-blue-50"></div> OCCUPIED</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-red-300 rounded-sm bg-red-50"></div> LOCKED</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-amber-300 rounded-sm bg-amber-50"></div> MAINTENANCE</div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 min-h-[400px]">
                  {filteredSlots.length === 0 ? (
                    <EmptyState icon={<Grid />} title="Không tìm thấy slot nào" description="Thử thay đổi bộ lọc hoặc thêm slot mới." />
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                      {filteredSlots.map(slot => (
                        <div
                          key={slot.id}
                          onClick={() => { setSelectedSlot(slot); setTargetStatus(slot.status); setStatusReason(""); }}
                          className={`
                            aspect-square flex items-center justify-center rounded-md border-2 font-bold text-xs cursor-pointer 
                            transition-all hover:scale-105 hover:shadow-md
                            ${selectedSlot?.id === slot.id ? "ring-2 ring-slate-400 ring-offset-2" : ""}
                            ${SLOT_STATUS_COLORS[slot.status] || "border-slate-200 bg-white text-slate-500"}
                          `}
                        >
                          {slot.slotCode?.split("-").pop() || slot.slotCode}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Slot Details */}
              <SlotDetailSidebar 
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                targetStatus={targetStatus}
                setTargetStatus={setTargetStatus}
                statusReason={statusReason}
                setStatusReason={setStatusReason}
                handleUpdateSlotStatus={handleUpdateSlotStatus}
              />
            </div>
          )}

        </div>
      </div>

      {/* --- MODALS --- */}
      <FloorModal 
        isOpen={showFloorModal}
        onClose={setShowFloorModal}
        editingItem={editingItem}
        form={form}
        setField={setField}
        handleSave={handleFloorSave}
      />

      <AreaModal 
        isOpen={showAreaModal}
        onClose={setShowAreaModal}
        editingItem={editingItem}
        form={form}
        setField={setField}
        handleSave={handleAreaSave}
        floors={floors}
        vehicleTypes={vehicleTypes}
      />

      <SlotModal 
        isOpen={showSlotModal}
        onClose={setShowSlotModal}
        form={form}
        setField={setField}
        handleSave={handleSlotSave}
        areas={areas}
        vehicleTypes={vehicleTypes}
      />
    </div>
  );
}
