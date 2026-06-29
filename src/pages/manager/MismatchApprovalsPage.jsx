import React, { useEffect, useState } from "react";
import { BellDot, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approvalService } from "@/services/approvalService";
import { formatDateTime } from "@/lib/format";
import { PageHeader, PageShell } from "@/components/layout/PageScaffold";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/ui/empty-state";

export default function MismatchApprovalsPage() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [reason, setReason] = useState("");

  const loadCases = async () => setCases(await approvalService.getMismatchCases());

  useEffect(() => {
    loadCases();
  }, []);

  const decide = async (decision) => {
    if (!selectedCase || !reason.trim()) {
      toast.error("Nhập lý do xử lý trước khi xác nhận hoặc từ chối.");
      return;
    }
    try {
      await approvalService.decideMismatchCase(selectedCase.id, { decision, reason });
      toast.success(decision === "APPROVE" ? "Đã xác nhận lệch biển số." : "Đã từ chối hồ sơ.");
      setSelectedCase(null);
      setReason("");
      await loadCases();
    } catch (error) {
      toast.error(error.message || "Không thể xử lý hồ sơ.");
    }
  };

  const pendingCount = cases.filter((item) => item.status === "PENDING").length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Manager · Exception approval"
        title="Phê duyệt lệch biển số"
        description="Xử lý cảnh báo biển số lúc ra không trùng khớp với dữ liệu lúc vào trước khi cho xe ra."
        icon={BellDot}
        meta={<Badge variant="secondary" className="rounded-md">{pendingCount} ca đang chờ</Badge>}
      />

      <Card className="app-table-card">
        <CardHeader>
          <CardTitle>Các ca cần xác minh</CardTitle>
          <CardDescription>Đối chiếu biển số vào/ra và ghi nhận quyết định quản lý.</CardDescription>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <EmptyState icon="MM" title="Chưa có ca lệch biển số" className="border-0 shadow-none" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hồ sơ</TableHead>
                  <TableHead>Biển số vào</TableHead>
                  <TableHead>Biển số ra</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-mono font-bold">{item.caseCode}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</div>
                    </TableCell>
                    <TableCell className="font-mono font-bold">{item.entryPlateNumber}</TableCell>
                    <TableCell className="font-mono font-bold">{item.exitPlateNumber}</TableCell>
                    <TableCell><Badge variant={item.status === "PENDING" ? "outline" : "secondary"}>{item.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedCase(item)}>Xem</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedCase)} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Chi tiết lệch biển số</DialogTitle>
            <DialogDescription>Xác nhận khi có đủ căn cứ cho xe ra bãi.</DialogDescription>
          </DialogHeader>
          {selectedCase && (
            <div className="flex flex-col gap-3 text-sm">
              <Line label="Mã hồ sơ" value={selectedCase.caseCode} />
              <Line label="Phiên" value={selectedCase.sessionCode} />
              <Line label="Biển số vào" value={selectedCase.entryPlateNumber} />
              <Line label="Biển số ra" value={selectedCase.exitPlateNumber} />
              <Line label="Lý do cảnh báo" value={selectedCase.reason} />
              <label className="flex flex-col gap-1.5">
                <span className="app-field-label">Lý do xác nhận/từ chối</span>
                <Input name="mismatch-decision-reason" autoComplete="off" value={reason} onChange={(event) => setReason(event.target.value)} />
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => decide("REJECT")}>
              <XCircle data-icon="inline-start" />
              Từ chối
            </Button>
            <Button onClick={() => decide("APPROVE")}>
              <CheckCircle2 data-icon="inline-start" />
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function Line({ label, value }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="app-field-label">{label}</p>
      <p className="mt-1 font-semibold">{value || "--"}</p>
    </div>
  );
}
