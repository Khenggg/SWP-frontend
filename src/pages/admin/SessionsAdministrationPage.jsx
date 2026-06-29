import React, { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Ban, LockKeyhole, RefreshCw, UserRoundCog } from "lucide-react";
import { toast } from "sonner";
import { adminSessionService } from "@/services/adminSessionService";
import { parkingService } from "@/services/parkingService";
import { formatDateTime } from "@/lib/format";
import { PageHeader, PageShell } from "@/components/layout/PageScaffold";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ACTION_META = {
  forceClose: {
    title: "Cưỡng chế đóng phiên",
    description: "Đóng phiên đang kẹt và ghi nhận thao tác can thiệp khẩn cấp.",
    icon: LockKeyhole,
  },
  cancel: {
    title: "Hủy phiên bị kẹt",
    description: "Chuyển phiên sang CANCELLED để giải phóng vận hành.",
    icon: Ban,
  },
  moveSlot: {
    title: "Điều chuyển slot thủ công",
    description: "Chuyển xe sang slot AVAILABLE khi cảm biến hoặc slot gặp lỗi.",
    icon: ArrowRightLeft,
  },
};

export default function SessionsAdministrationPage() {
  const [sessions, setSessions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");
  const [newSlotId, setNewSlotId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const availableSlots = useMemo(() => slots.filter((slot) => slot.status === "AVAILABLE"), [slots]);
  const meta = action ? ACTION_META[action] : null;
  const Icon = meta?.icon;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessionData, slotData] = await Promise.all([
        adminSessionService.getActiveSessions(),
        parkingService.getSlots(),
      ]);
      setSessions(sessionData);
      setSlots(slotData);
    } catch (error) {
      toast.error(error.message || "Không tải được dữ liệu quản trị phiên.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAction = (session, nextAction) => {
    setSelectedSession(session);
    setAction(nextAction);
    setReason("");
    setNewSlotId("");
  };

  const closeDialog = () => {
    setSelectedSession(null);
    setAction(null);
    setReason("");
    setNewSlotId("");
  };

  const submitAction = async () => {
    if (!selectedSession || !action) return;
    if (!reason.trim()) {
      toast.error("Admin phải nhập lý do can thiệp.");
      return;
    }

    try {
      if (action === "forceClose") {
        await adminSessionService.forceClose(selectedSession.id, { reason });
      }
      if (action === "cancel") {
        await adminSessionService.cancel(selectedSession.id, { reason });
      }
      if (action === "moveSlot") {
        if (!newSlotId) {
          toast.error("Chọn slot mới trước khi điều chuyển.");
          return;
        }
        await adminSessionService.moveSlot(selectedSession.id, { reason, newSlotId });
      }
      toast.success("Đã ghi nhận thao tác quản trị phiên.");
      closeDialog();
      await loadData();
    } catch (error) {
      toast.error(error.message || "Không thể thực hiện thao tác.");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin · Emergency control"
        title="Quản trị phiên và slot"
        description="Can thiệp khẩn cấp cho phiên bị kẹt, hủy phiên sai hoặc điều chuyển slot thủ công. Mọi thao tác đều bắt buộc ghi lý do."
        icon={UserRoundCog}
        actions={
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw data-icon="inline-start" />
            Tải lại
          </Button>
        }
      />

      <Card className="app-table-card">
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Mọi thao tác admin đều bắt buộc nhập lý do và ghi audit log mock.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Đang tải phiên...</div>
          ) : sessions.length === 0 ? (
            <EmptyState title="Không có phiên active" description="Chưa có phiên nào cần quản trị khẩn cấp." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phiên</TableHead>
                  <TableHead>Thẻ / biển số</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Vào lúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono font-black">{session.sessionCode}</TableCell>
                    <TableCell>
                      <div className="font-mono font-bold">{session.cardCode}</div>
                      <div className="text-xs text-muted-foreground">{session.plateNumber}</div>
                    </TableCell>
                    <TableCell>{session.floorCode} / {session.areaCode} / {session.slotCode}</TableCell>
                    <TableCell>{formatDateTime(session.entryTime)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{session.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAction(session, "moveSlot")}>
                          <ArrowRightLeft data-icon="inline-start" />
                          Move
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openAction(session, "forceClose")}>
                          <LockKeyhole data-icon="inline-start" />
                          Close
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openAction(session, "cancel")}>
                          <Ban data-icon="inline-start" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(action && selectedSession)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {Icon && <Icon aria-hidden="true" />}
              {meta?.title}
            </DialogTitle>
            <DialogDescription>{meta?.description}</DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="font-mono font-black">{selectedSession.sessionCode}</div>
              <div className="mt-1 text-muted-foreground">{selectedSession.cardCode} / {selectedSession.plateNumber}</div>
            </div>
          )}

          {action === "moveSlot" && (
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Slot mới</span>
              <Select value={newSlotId} onValueChange={setNewSlotId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn slot AVAILABLE" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.code}>
                      {slot.floorCode} / {slot.areaCode} / {slot.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="app-field-label">Lý do can thiệp</span>
            <Input
              name="admin-session-reason"
              autoComplete="off"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do bắt buộc..."
            />
          </label>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Hủy</Button>
            <Button onClick={submitAction}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
