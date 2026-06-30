import React, { useState, useEffect } from "react";
import { pricingService } from "../../services/pricingService";
import { parkingService } from "../../services/parkingService";
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
import { Search, Plus, RefreshCw, Eye, Info } from "lucide-react";
import { COMMON_STATUS } from "@/constants";

import PricingRuleModal from "@/components/manager/pricing/PricingRuleModal";
import PricingRuleSidebar from "@/components/manager/pricing/PricingRuleSidebar";

function formatVND(amount) { return Number(amount).toLocaleString("vi-VN") + "đ"; }
function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
}

const STATUS_BADGE = {
  [COMMON_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [COMMON_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border-slate-200",
  "SCHEDULED": "bg-orange-100 text-orange-700 border-orange-200",
  "EXPIRED": "bg-gray-100 text-gray-500 border-gray-200"
};

const EMPTY_FORM = { vehicleTypeId: "", dayPrice: "", nightPrice: "", monthlyPrice: "", lostCardFee: "", effectiveFrom: "", status: COMMON_STATUS.ACTIVE };

export default function PricingManagementPage() {
  const [rules, setRules] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  
  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedRule, setSelectedRule] = useState(null);
  
  // Form Modal
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const rulesData = await pricingService.getPricingRules();
      setRules(rulesData);
      const types = await parkingService.getVehicleTypes();
      setVehicleTypes(types);
    } catch (e) {
      toast.error("Lỗi lấy dữ liệu: " + e.message);
    }
  };

  const handleRefresh = () => {
    setFilterSearch("");
    setFilterVehicle("ALL");
    setFilterStatus("ALL");
    fetchData();
  };

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const filtered = rules.filter((r) => {
    const matchVehicle = filterVehicle === "ALL" || r.vehicleType?.name === filterVehicle || r.vehicleTypeName === filterVehicle;
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchSearch = r.vehicleType?.name?.toLowerCase().includes(filterSearch.toLowerCase()) || 
                        r.vehicleTypeName?.toLowerCase().includes(filterSearch.toLowerCase());
    return matchVehicle && matchStatus && (filterSearch === "" || matchSearch);
  });

  const validate = (data) => {
    const errs = {};
    if (!data.vehicleTypeId) errs.vehicleTypeId = "Bắt buộc";
    if (!data.effectiveFrom) errs.effectiveFrom = "Bắt buộc";
    const fields = ["dayPrice", "nightPrice", "monthlyPrice", "lostCardFee"];
    fields.forEach((f) => {
      if (data[f] === "" || data[f] === undefined) { errs[f] = "Bắt buộc"; }
      else if (Number(data[f]) < 0) { errs[f] = "Phải >= 0"; }
    });
    return errs;
  };

  const openCreate = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      vehicleTypeId: String(rule.vehicleTypeId),
      dayPrice: String(rule.dayPrice),
      nightPrice: String(rule.nightPrice),
      monthlyPrice: String(rule.monthlyPrice),
      lostCardFee: String(rule.lostCardFee),
      effectiveFrom: rule.effectiveFrom?.split('T')[0] || rule.effectiveFrom?.split(' ')[0],
      status: rule.status
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openDuplicate = (rule) => {
    setEditingRule(null);
    setForm({
      vehicleTypeId: String(rule.vehicleTypeId),
      dayPrice: String(rule.dayPrice),
      nightPrice: String(rule.nightPrice),
      monthlyPrice: String(rule.monthlyPrice),
      lostCardFee: String(rule.lostCardFee),
      effectiveFrom: "", // clear date for duplicate
      status: COMMON_STATUS.ACTIVE
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleStopRule = async (rule) => {
    if(!confirm("Bạn có chắc muốn ngưng áp dụng rule này?")) return;
    try {
      await pricingService.updatePricingRule(rule.id, { status: "INACTIVE" });
      toast.success("Đã ngưng áp dụng rule!");
      fetchData();
      if(selectedRule?.id === rule.id) setSelectedRule(null);
    } catch(e) {
      toast.error(e.message || "Lỗi khi ngưng áp dụng");
    }
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const payload = {
      vehicleTypeId: Number(form.vehicleTypeId),
      dayPrice: Number(form.dayPrice),
      nightPrice: Number(form.nightPrice),
      monthlyPrice: Number(form.monthlyPrice),
      lostCardFee: Number(form.lostCardFee),
      effectiveFrom: form.effectiveFrom,
      status: form.status
    };
    try {
      if (editingRule) {
        await pricingService.updatePricingRule(editingRule.id, payload);
        toast.success("Cập nhật rule thành công!");
      } else {
        await pricingService.addPricingRule(payload);
        toast.success("Tạo rule mới thành công!");
      }
      fetchData();
      setShowModal(false);
      if(selectedRule && editingRule?.id === selectedRule.id) {
        setSelectedRule(null); 
      }
    } catch (e) {
      toast.error(e.message || "Lưu thất bại!");
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 gap-4 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Cấu hình Giá</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý các rule giá theo loại xe và hiệu lực. Phiên gửi xe đang hoạt động sẽ dùng snapshot giá tại thời điểm vào bãi.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Tìm theo loại xe..." 
              className="pl-9 bg-slate-50 border-slate-200"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <Select value={filterVehicle} onValueChange={setFilterVehicle}>
              <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại xe</SelectItem>
                {vehicleTypes.map((v) => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value={COMMON_STATUS.ACTIVE}>ACTIVE</SelectItem>
                <SelectItem value={COMMON_STATUS.INACTIVE}>INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" className="bg-white" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo rule giá
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2 text-blue-700 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>Phiên gửi xe đang hoạt động sẽ dùng <strong>snapshot giá</strong> tại thời điểm vào bãi. Thay đổi sau thời điểm này chỉ áp dụng cho các phiên mới.</p>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-slate-200 flex-1 flex flex-col min-h-[400px]">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">ID</TableHead>
                  <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Loại xe</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right whitespace-nowrap">Giá ngày (06:00 - 22:00)</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right whitespace-nowrap">Giá đêm (22:00 - 06:00)</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right whitespace-nowrap">Giá vé tháng</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right whitespace-nowrap">Phí mất thẻ</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center whitespace-nowrap">Hiệu lực từ</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center whitespace-nowrap">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center whitespace-nowrap">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-slate-500">Không tìm thấy rule nào</TableCell></TableRow>
                ) : filtered.map((rule) => (
                  <TableRow 
                    key={rule.id} 
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedRule?.id === rule.id ? "bg-blue-50/50" : ""}`}
                    onClick={() => setSelectedRule(rule)}
                  >
                    <TableCell className="font-medium text-slate-600">#{rule.id}</TableCell>
                    <TableCell className="font-medium">{rule.vehicleType?.name || rule.vehicleTypeName}</TableCell>
                    <TableCell className="text-right">{formatVND(rule.dayPrice)}</TableCell>
                    <TableCell className="text-right">{formatVND(rule.nightPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{formatVND(rule.monthlyPrice)}</TableCell>
                    <TableCell className="text-right">{formatVND(rule.lostCardFee)}</TableCell>
                    <TableCell className="text-center">{formatDate(rule.effectiveFrom).split(' ')[0]}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${STATUS_BADGE[rule.status] || STATUS_BADGE.ACTIVE}`}>
                        {rule.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => setSelectedRule(rule)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <div>Hiển thị 1 - {filtered.length} trong tổng số {filtered.length} rule</div>
          </div>
        </div>
      </div>

      <PricingRuleSidebar 
        selectedRule={selectedRule}
        setSelectedRule={setSelectedRule}
        openEdit={openEdit}
        openDuplicate={openDuplicate}
        handleStopRule={handleStopRule}
      />

      <PricingRuleModal 
        isOpen={showModal}
        onClose={setShowModal}
        editingRule={editingRule}
        form={form}
        setField={setField}
        formErrors={formErrors}
        handleSave={handleSave}
        vehicleTypes={vehicleTypes}
      />
    </div>
  );
}
