import React from "react";
import { Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

const PRIORITY_BADGE = {
  HIGH: "bg-red-100 text-red-600 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-600 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

export default function MismatchTable({ 
  cases, 
  isLoading, 
  selectedCaseId, 
  onRowClick
}) {
  return (
    <div className="overflow-x-auto flex-1">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 text-xs text-slate-500 font-semibold tracking-wide">
            <TableHead className="w-[40px] px-4"><input type="checkbox" className="rounded border-slate-300" disabled /></TableHead>
            <TableHead className="whitespace-nowrap">Mã yêu cầu</TableHead>
            <TableHead className="whitespace-nowrap">Phiên gửi</TableHead>
            <TableHead className="whitespace-nowrap">Thẻ xe</TableHead>
            <TableHead className="whitespace-nowrap">Biển số thẻ</TableHead>
            <TableHead className="whitespace-nowrap">Biển số thực tế</TableHead>
            <TableHead className="whitespace-nowrap">Thời gian</TableHead>
            <TableHead className="whitespace-nowrap text-center">Mức độ</TableHead>
            <TableHead className="whitespace-nowrap">Người tạo</TableHead>
            <TableHead className="whitespace-nowrap text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={10} className="text-center py-10 text-slate-500">Đang tải dữ liệu...</TableCell></TableRow>
          ) : cases.length === 0 ? (
            <TableRow><TableCell colSpan={10} className="text-center py-10 text-slate-500">Không tìm thấy yêu cầu nào</TableCell></TableRow>
          ) : (
            cases.map((item) => {
              const isSelected = selectedCaseId === item.id;
              
              // Mocking priority for demo purposes if not present
              const priority = item.priority || "MEDIUM";
              const priorityLabel = priority === "HIGH" ? "Cao" : priority === "MEDIUM" ? "Trung bình" : "Thấp";

              // Mock creator role
              const creatorRole = item.creatorRole || "STAFF";
              const caseCode = item.caseCode || `MM-${new Date(item.createdAt || new Date()).getFullYear()}-${(item.id || 0).toString().padStart(5, '0')}`;

              return (
                <TableRow 
                  key={item.id} 
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                  onClick={() => onRowClick(item)}
                >
                  <TableCell className="px-4"><input type="checkbox" className="rounded border-slate-300" onClick={e => e.stopPropagation()} /></TableCell>
                  <TableCell className="font-mono text-sm text-blue-600 font-medium whitespace-nowrap">
                    {caseCode}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium whitespace-nowrap text-slate-700">
                    {item.sessionCode || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 whitespace-nowrap">
                    {item.cardCode || "CARD-UNKNOWN"}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-slate-700 text-sm whitespace-nowrap">
                    {item.entryPlateNumber || "N/A"}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-slate-700 text-sm whitespace-nowrap">
                    {item.exitPlateNumber || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{item.createdAt ? formatDateTime(item.createdAt).split(' ')[0] : ''}</span>
                      <span className="text-xs text-slate-400">{item.createdAt ? formatDateTime(item.createdAt).split(' ')[1] : ''}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold border ${PRIORITY_BADGE[priority]}`}>
                      {priorityLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.reporterName || item.createdBy}`} 
                          alt="avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{item.reporterName || item.createdBy || "Staff"}</span>
                        <Badge variant="outline" className={`px-1.5 py-0 text-[9px] w-fit font-bold ${creatorRole === 'MANAGER' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
                          {creatorRole}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 shadow-sm" onClick={(e) => { e.stopPropagation(); onRowClick(item); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
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
