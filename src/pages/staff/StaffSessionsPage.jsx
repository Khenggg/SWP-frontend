import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Search } from "lucide-react";
import { staffSessionService } from "@/services/staffSessionService";
import { formatDateTime } from "@/lib/format";
import { PageHeader, PageShell } from "@/components/layout/PageScaffold";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

export default function StaffSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      setSessions(await staffSessionService.listActiveSessions());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return sessions;
    return sessions.filter((item) =>
      `${item.sessionCode} ${item.cardCode} ${item.plateNumber} ${item.vehicleTypeName} ${item.paymentStatus}`
        .toLowerCase()
        .includes(text)
    );
  }, [query, sessions]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Staff · Operations"
        title="Tìm kiếm phiên gửi"
        description="Danh sách xe đang trong bãi để Staff xử lý nhanh tại cổng ra, báo mất thẻ hoặc tra cứu trạng thái thanh toán."
        icon={Search}
        actions={
          <Button variant="outline" onClick={loadSessions} disabled={isLoading}>
            <RefreshCw data-icon="inline-start" />
            Tải lại
          </Button>
        }
      />

      <Card className="app-card">
        <CardHeader>
          <CardTitle>Bộ lọc nhanh</CardTitle>
          <CardDescription>Tìm theo mã phiên, mã thẻ, biển số, loại xe hoặc trạng thái thanh toán.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col gap-1.5">
            <span className="app-field-label">Từ khóa</span>
            <div className="flex items-center gap-2">
              <Search aria-hidden="true" className="text-muted-foreground" />
              <Input
                name="staff-session-search"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nhập từ khóa..."
              />
            </div>
          </label>
        </CardContent>
      </Card>

      <Card className="app-table-card">
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Đang tải phiên...</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon="P" title="Không có phiên phù hợp" description="Thử đổi từ khóa hoặc tải lại dữ liệu mock." className="border-0 shadow-none" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phiên</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Vào lúc</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-mono font-bold">{session.sessionCode}</div>
                      <div className="text-xs text-muted-foreground">{session.cardCode}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-bold">{session.plateNumber}</div>
                      <div className="text-xs text-muted-foreground">{session.vehicleTypeName}</div>
                    </TableCell>
                    <TableCell>{session.slotCode || session.areaCode}</TableCell>
                    <TableCell>{formatDateTime(session.entryTime)}</TableCell>
                    <TableCell><Badge variant="secondary">{session.paymentStatus}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline"><Link to="/staff/exit">Ra bãi</Link></Button>
                        <Button asChild size="sm" variant="ghost"><Link to="/staff/lost-card">Mất thẻ</Link></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
