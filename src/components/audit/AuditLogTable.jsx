import React from "react";
import { Clock, User, LayoutGrid, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AuditLogTable({ logs, isLoading, selectedLogId, onRowClick }) {
  return (
    <div className="overflow-x-auto flex-1">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold text-slate-600 w-[50px] text-center">#</TableHead>
            <TableHead className="font-semibold text-slate-600 whitespace-nowrap"><Clock className="w-4 h-4 inline-block mr-1 mb-0.5 text-slate-400" /> Thời gian</TableHead>
            <TableHead className="font-semibold text-slate-600 whitespace-nowrap"><User className="w-4 h-4 inline-block mr-1 mb-0.5 text-slate-400" /> Người thực hiện</TableHead>
            <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Hành động</TableHead>
            <TableHead className="font-semibold text-slate-600 whitespace-nowrap"><LayoutGrid className="w-4 h-4 inline-block mr-1 mb-0.5 text-slate-400" /> Đối tượng</TableHead>
            <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Nguồn</TableHead>
            <TableHead className="font-semibold text-slate-600 whitespace-nowrap w-[50px] text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">Đang tải nhật ký...</TableCell></TableRow>
          ) : logs.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">Không tìm thấy dữ liệu nhật ký phù hợp</TableCell></TableRow>
          ) : (
            logs.map((log, idx) => {
              const isSelected = selectedLogId === log.id;
              return (
                <TableRow 
                  key={log.id} 
                  className={`hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                  onClick={() => onRowClick && onRowClick(log)}
                >
                  <TableCell className="text-center text-slate-400 text-xs">{idx + 1}</TableCell>
                  <TableCell className="text-sm font-medium">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell className="font-mono text-sm">{log.actorUserId || <span className="text-slate-400 italic">Hệ thống</span>}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-700">{log.action}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{log.targetType}</span>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {log.targetId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${log.sourceService === 'CORE_API' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-purple-600 border-purple-200 bg-purple-50'}`}>
                      {log.sourceService || 'UNKNOWN'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className={`h-8 w-8 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
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
