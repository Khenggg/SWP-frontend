import React, { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approvalService } from "@/services/approvalService";
import { formatDateTime, formatVND } from "@/lib/format";
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

export default function LostCardApprovalsPage() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [reason, setReason] = useState("");

  const loadCases = async () => setCases(await approvalService.getLostCardCases());

  useEffect(() => {
    loadCases();
  }, []);

  const decide = async (decision) => {
    if (!selectedCase || !reason.trim()) {
      toast.error("Nhập lý do xử lý trước khi phê duyệt hoặc từ chối.");
      return;
    }
    try {
      await approvalService.decideLostCardCase(selectedCase.id, { decision, reason });
      toast.success(decision === "APPROVE" ? "Đã duyệt hồ sơ mất thẻ." : "Đã từ chối hồ sơ.");
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
        title="Phê duyệt báo mất thẻ"
        description="Duyệt yêu cầu do Staff tạo tại cổng ra và khóa thẻ bị mất nếu hồ sơ hợp lệ."
        icon={ClipboardCheck}
        meta={<Badge variant="secondary" className="rounded-md">{pendingCount} hồ sơ đang chờ</Badge>}
      />

      <Card className="app-table-card">
        <CardHeader>
          <CardTitle>Hàng đợi mất thẻ</CardTitle>
          <CardDescription>Kiểm tra xác minh và quyết định trước khi cho xe ra.</CardDescription>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <EmptyState icon="LC" title="Chưa có hồ sơ mất thẻ" className="border-0 shadow-none" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hồ sơ</TableHead>
                  <TableHead>Xe / Thẻ</TableHead>
                  <TableHead>Người báo</TableHead>
                  <TableHead>Phí</TableHead>
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
                    <TableCell>
                      <div className="font-mono font-bold">{item.plateNumber}</div>
                      <div className="text-xs text-muted-foreground">{item.cardCode}</div>
                    </TableCell>
                    <TableCell>{item.reporterName}</TableCell>
                    <TableCell>{formatVND(item.lostCardFee)}</TableCell>
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
            <DialogTitle>Chi tiết hồ sơ mất thẻ</DialogTitle>
            <DialogDescription>Kiểm tra thông tin xác minh trước khi ra quyết định.</DialogDescription>
          </DialogHeader>
          {selectedCase && (
            <div className="flex flex-col gap-3 text-sm">
              <Line label="Mã hồ sơ" value={selectedCase.caseCode} />
              <Line label="Phiên" value={selectedCase.sessionCode} />
              <Line label="Biển số" value={selectedCase.plateNumber} />
              <Line label="Xác minh" value={selectedCase.verificationNote} />
              <Line label="Lý do Staff ghi nhận" value={selectedCase.reason} />
              <label className="flex flex-col gap-1.5">
                <span className="app-field-label">Lý do duyệt/từ chối</span>
                <Input name="lost-card-decision-reason" autoComplete="off" value={reason} onChange={(event) => setReason(event.target.value)} />
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
              Duyệt
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
