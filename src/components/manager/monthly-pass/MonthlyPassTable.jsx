import React from "react";
import { Eye, Edit, RefreshCw, Lock, Unlock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LicensePlate from "@/components/ui/license-plate";
import { PASS_STATUS } from "@/constants";

const STATUS_BADGE = {
  [PASS_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-300",
  [PASS_STATUS.EXPIRED]: "bg-slate-100 text-slate-500 border-slate-300",
  [PASS_STATUS.LOCKED]: "bg-red-100 text-red-700 border-red-300",
  [PASS_STATUS.CANCELLED]: "bg-amber-100 text-amber-700 border-amber-300",
};

const calculateRemainingDays = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  return days;
};

export default function MonthlyPassTable({ 
  passes, 
  isLoading, 
  selectedPassId, 
  onRowClick,
  onEdit,
  onRenew,
  onLockToggle
}) {
  return (
    <div className="overflow-x-auto flex-1">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 text-xs text-slate-500 font-semibold tracking-wide">
            <TableHead className="whitespace-nowrap">Mã vé</TableHead>
            <TableHead className="whitespace-nowrap">Chủ xe</TableHead>
            <TableHead className="whitespace-nowrap">Biển số</TableHead>
            <TableHead className="whitespace-nowrap">Loại xe</TableHead>
            <TableHead className="whitespace-nowrap">SĐT</TableHead>
            <TableHead className="whitespace-nowrap">Hiệu lực</TableHead>
            <TableHead className="whitespace-nowrap text-center">Số ngày còn lại</TableHead>
            <TableHead className="whitespace-nowrap text-center">Trạng thái</TableHead>
            <TableHead className="whitespace-nowrap text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={9} className="text-center py-10 text-slate-500">Đang tải dữ liệu...</TableCell></TableRow>
          ) : passes.length === 0 ? (
            <TableRow><TableCell colSpan={9} className="text-center py-10 text-slate-500">Không tìm thấy vé tháng nào</TableCell></TableRow>
          ) : (
            passes.map((pass) => {
              const remainingDays = calculateRemainingDays(pass.endDate);
              const isSelected = selectedPassId === pass.id;
              const isExpiringSoon = pass.status === PASS_STATUS.ACTIVE && remainingDays <= 7 && remainingDays >= 0;
              
              let remainingDisplay = `${remainingDays} ngày`;
              let remainingClass = "text-slate-700 font-medium";
              
              if (remainingDays < 0) {
                remainingDisplay = `${remainingDays} ngày`;
                remainingClass = "text-red-500 font-bold";
              } else if (isExpiringSoon) {
                remainingClass = "text-amber-500 font-bold";
              }

              let statusDisplay = pass.status;
              let badgeClass = STATUS_BADGE[pass.status] || "bg-slate-100 text-slate-500 border-slate-300";
              if (pass.status === PASS_STATUS.ACTIVE && remainingDays < 0) {
                 statusDisplay = PASS_STATUS.EXPIRED;
                 badgeClass = STATUS_BADGE[PASS_STATUS.EXPIRED];
              } else if (isExpiringSoon) {
                 statusDisplay = "EXPIRING_SOON";
                 badgeClass = "bg-amber-100 text-amber-700 border-amber-300";
              }

              return (
                <TableRow 
                  key={pass.id} 
                  className={`hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                  onClick={() => onRowClick(pass)}
                >
                  <TableCell className="font-mono text-xs text-blue-600 font-medium whitespace-nowrap">
                    MP-{new Date(pass.createdAt || new Date()).getFullYear()}-{(pass.id || "").toString().padStart(3, "0")}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800 font-medium">{pass.ownerName}</TableCell>
                  <TableCell><LicensePlate plate={pass.plate || pass.plateNumber} size="sm" /></TableCell>
                  <TableCell className="text-sm text-slate-600">{pass.vehicleTypeName}</TableCell>
                  <TableCell className="text-sm text-slate-600">{pass.phone}</TableCell>
                  <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                    {pass.startDate} - {pass.endDate}
                  </TableCell>
                  <TableCell className={`text-sm text-center ${remainingClass}`}>
                    {remainingDisplay}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                      {statusDisplay}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" onClick={() => onRowClick(pass)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-800" onClick={() => onEdit(pass)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-emerald-600" onClick={() => onRenew(pass)}>
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className={`h-7 w-7 text-slate-400 ${pass.status === PASS_STATUS.LOCKED ? 'hover:text-emerald-600' : 'hover:text-red-600'}`} onClick={() => onLockToggle(pass)}>
                        {pass.status === PASS_STATUS.LOCKED ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
