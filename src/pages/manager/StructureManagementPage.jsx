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

const AREA_STATUS_BADGE = {
  [COMMON_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  [SLOT_STATUS.LOCKED]: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  [SLOT_STATUS.MAINTENANCE]: "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
};

const SLOT_STATUS_BADGE = {
  [SLOT_STATUS.AVAILABLE]: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  [SLOT_STATUS.OCCUPIED]: "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  [SLOT_STATUS.MAINTENANCE]: "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  [SLOT_STATUS.LOCKED]: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const GATE_TYPE_BADGE = {
  ENTRY: "bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
  EXIT: "bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
};

const TABS = ["Tầng (Floors)", "Khu Vực (Areas)", "Slot", "Cổng (Gates)"];

export default function StructureManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [gates, setGates] = useState([]);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const [floorsData, areasData, slotsData, gatesData] = await Promise.all([
          parkingService.getFloors(),
          parkingService.getAreas(),
          parkingService.getSlots(),
          parkingService.getGates(),
        ]);
        setFloors(floorsData);
        setAreas(areasData);
        setSlots(slotsData);
        setGates(gatesData);
      } catch (e) {
        console.error("Lỗi tải thông tin cấu trúc bãi xe:", e);
      }
    };
    fetchStructure();
  }, []);

  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterSlotStatus, setFilterSlotStatus] = useState("ALL");

  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showSlotStatusModal, setShowSlotStatusModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState({});

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  // Floor actions
  const openCreateFloor = () => { setEditingFloor(null); setForm({ code: "", name: "", status: COMMON_STATUS.ACTIVE }); setShowFloorModal(true); };
  const openEditFloor = (floor) => { setEditingFloor(floor); setForm({ code: floor.code, name: floor.name, status: floor.status }); setShowFloorModal(true); };
  const handleFloorSave = async () => {
    if (!form.code || !form.name) return;
    try {
      if (editingFloor) {
        await parkingService.updateFloor(editingFloor.id, form);
      } else {
        await parkingService.addFloor(form);
      }
      const updatedFloors = await parkingService.getFloors();
      setFloors(updatedFloors);
      setShowFloorModal(false);
      toast.success("Lưu thông tin tầng thành công!");
    } catch (e) {
      toast.error(e.message || "Lưu thông tin tầng thất bại");
    }
  };

  // Slot status
  const openSlotStatus = (slot) => { setEditingSlot(slot); setForm({ status: slot.status }); setShowSlotStatusModal(true); };
  const handleSlotStatus = async () => {
    try {
      await parkingService.updateSlotStatus(editingSlot.id, form.status);
      const updatedSlots = await parkingService.getSlots();
      setSlots(updatedSlots);
      setShowSlotStatusModal(false);
      toast.success("Cập nhật trạng thái slot thành công!");
    } catch (e) {
      toast.error(e.message || "Cập nhật slot thất bại");
    }
  };

  // Filtered data
  const filteredAreas = filterFloor === "ALL" ? areas : areas.filter((a) => a.floorCode === filterFloor);
  const filteredSlots = slots.filter((s) => {
    const matchFloor = filterFloor === "ALL" || s.floorCode === filterFloor;
    const matchStatus = filterSlotStatus === "ALL" || s.status === filterSlotStatus;
    return matchFloor && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800">Quản Lý Cấu Trúc Bãi Xe</h2>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý tầng, khu vực, slot đỗ và cổng ra vào</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === idx ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Floors Tab */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateFloor}>+ Thêm Tầng</Button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <TableHead className="px-5 py-3 text-left">Mã Tầng</TableHead>
                  <TableHead className="px-5 py-3 text-left">Tên</TableHead>
                  <TableHead className="px-5 py-3 text-center">Số Khu</TableHead>
                  <TableHead className="px-5 py-3 text-center">Số Slot</TableHead>
                  <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
                  <TableHead className="px-5 py-3 text-center">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {floors.map((floor) => (
                  <TableRow key={floor.id} className="hover:bg-slate-50">
                    <TableCell className="px-5 py-3 font-mono font-bold text-slate-800">{floor.code}</TableCell>
                    <TableCell className="px-5 py-3 text-slate-700">{floor.name}</TableCell>
                    <TableCell className="px-5 py-3 text-center text-slate-600">{floor.totalAreas}</TableCell>
                    <TableCell className="px-5 py-3 text-center text-slate-600">{floor.totalSlots}</TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${AREA_STATUS_BADGE[floor.status]}`}>{floor.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => openEditFloor(floor)} className="text-xs font-bold text-blue-600 hover:text-blue-700">Sửa</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Areas Tab */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả tầng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả tầng</SelectItem>
                {floors.map((f) => <SelectItem key={f.id} value={f.code}>{f.code} - {f.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-400 ml-auto">{filteredAreas.length} khu vực</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <TableHead className="px-5 py-3 text-left">Mã Khu</TableHead>
                  <TableHead className="px-5 py-3 text-left">Tên</TableHead>
                  <TableHead className="px-5 py-3 text-left">Tầng</TableHead>
                  <TableHead className="px-5 py-3 text-left">Loại Xe</TableHead>
                  <TableHead className="px-5 py-3 text-center">Slot Trống/Tổng</TableHead>
                  <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredAreas.map((area) => (
                  <TableRow key={area.id} className="hover:bg-slate-50">
                    <TableCell className="px-5 py-3 font-mono font-bold text-slate-800">{area.code}</TableCell>
                    <TableCell className="px-5 py-3 text-slate-700">{area.name}</TableCell>
                    <TableCell className="px-5 py-3 text-slate-500">{area.floorCode}</TableCell>
                    <TableCell className="px-5 py-3 text-slate-600">{area.vehicleTypeName}</TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <span className="font-bold text-emerald-700">{area.availableSlots}</span>
                      <span className="text-slate-400">/{area.totalSlots}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${AREA_STATUS_BADGE[area.status]}`}>{area.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tất cả tầng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả tầng</SelectItem>
                {floors.map((f) => <SelectItem key={f.id} value={f.code}>{f.code}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterSlotStatus} onValueChange={setFilterSlotStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {Object.values(SLOT_STATUS).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-400 ml-auto">{filteredSlots.length} slot</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <TableHead className="px-5 py-3 text-left">Mã Slot</TableHead>
                  <TableHead className="px-5 py-3 text-left">Tầng</TableHead>
                  <TableHead className="px-5 py-3 text-left">Khu Vực</TableHead>
                  <TableHead className="px-5 py-3 text-left">Loại Xe</TableHead>
                  <TableHead className="px-5 py-3 text-center">Phiên Hiện Tại</TableHead>
                  <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
                  <TableHead className="px-5 py-3 text-center">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => (
                  <TableRow key={slot.id} className="hover:bg-slate-50">
                    <TableCell className="px-5 py-3 font-mono font-bold text-slate-800">{slot.code}</TableCell>
                    <TableCell className="px-5 py-3 text-slate-500">{slot.floorCode}</TableCell>
                    <TableCell className="px-5 py-3 text-slate-600">{slot.areaCode}</TableCell>
                    <TableCell className="px-5 py-3 text-slate-600">{slot.vehicleTypeName}</TableCell>
                    <TableCell className="px-5 py-3 text-center text-xs text-blue-700 font-mono">{slot.sessionCode || "—"}</TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${SLOT_STATUS_BADGE[slot.status]}`}>{slot.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => openSlotStatus(slot)} className="text-xs font-bold text-amber-600 hover:text-amber-700">Đổi Trạng Thái</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Gates Tab */}
      {activeTab === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <TableHead className="px-5 py-3 text-left">Mã Cổng</TableHead>
                <TableHead className="px-5 py-3 text-left">Tên</TableHead>
                <TableHead className="px-5 py-3 text-center">Loại</TableHead>
                <TableHead className="px-5 py-3 text-center">Tầng</TableHead>
                <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {gates.map((gate) => (
                <TableRow key={gate.id} className="hover:bg-slate-50">
                  <TableCell className="px-5 py-3 font-mono font-bold text-slate-800">{gate.code}</TableCell>
                  <TableCell className="px-5 py-3 text-slate-700">{gate.name}</TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${GATE_TYPE_BADGE[gate.type]}`}>{gate.type}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-center text-slate-500">{gate.floorCode}</TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${gate.status === COMMON_STATUS.ACTIVE ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-slate-100 text-slate-500 border border-slate-300"}`}>{gate.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Floor Modal */}
      <Dialog open={showFloorModal} onOpenChange={setShowFloorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFloor ? `Sửa Tầng: ${editingFloor.code}` : "Thêm Tầng Mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Mã Tầng *</label>
              <Input value={form.code || ""} onChange={(e) => setField("code", e.target.value)} placeholder="VD: F4" className="font-mono" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Tên Tầng *</label>
              <Input value={form.name || ""} onChange={(e) => setField("name", e.target.value)} placeholder="VD: Tầng 4" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFloorModal(false)}>Hủy</Button>
            <Button onClick={handleFloorSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slot Status Modal */}
      <Dialog open={showSlotStatusModal} onOpenChange={setShowSlotStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi Trạng Thái: {editingSlot?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {[SLOT_STATUS.AVAILABLE, SLOT_STATUS.MAINTENANCE, SLOT_STATUS.LOCKED].map((s) => (
                <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                  <input type="radio" name="slotStatus" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-blue-600" />
                  <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${SLOT_STATUS_BADGE[s]}`}>{s}</Badge>
                </label>
              ))}
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">⚠️ Slot đang OCCUPIED chỉ có thể đổi sau khi phiên gửi hoàn tất.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlotStatusModal(false)}>Hủy</Button>
            <Button onClick={handleSlotStatus}>Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
