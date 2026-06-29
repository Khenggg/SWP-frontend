import React, { useEffect, useMemo, useState } from "react";
import { FileClock, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";
import { formatDateTime } from "@/lib/format";
import { PageHeader, PageShell } from "@/components/layout/PageScaffold";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

export default function AuditLogsPage({ scope = "manager" }) {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("ALL");
  const [action, setAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params = {
        query,
        action,
        source: source === "ALL" ? "" : source,
      };
      setLogs(await auditService.getAuditLogs(params));
    } catch (error) {
      toast.error(error.message || "Không thể tải nhật ký.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const visibleLogs = useMemo(() => {
    if (scope === "admin") return logs;
    return logs.filter((item) => item.severity !== "SECURITY" || item.actor !== "admin01");
  }, [logs, scope]);

  const title = scope === "admin" ? "Quản trị nhật ký hệ thống" : "Nhật ký kiểm toán";
  const description = scope === "admin"
    ? "Admin xem toàn bộ hành vi nhạy cảm, bao gồm thao tác bảo mật và can thiệp khẩn cấp."
    : "Manager tra cứu các thay đổi nghiệp vụ quan trọng trong vận hành bãi xe.";

  return (
    <PageShell>
      <PageHeader
        eyebrow={scope === "admin" ? "Admin · Security" : "Manager · Audit"}
        title={title}
        description={description}
        icon={FileClock}
        actions={
          <Button variant="outline" onClick={loadLogs} disabled={isLoading}>
            <RefreshCw data-icon="inline-start" />
            Tải lại
          </Button>
        }
      />

      <Card className="app-card">
        <CardHeader>
          <CardTitle>Bộ lọc nhật ký</CardTitle>
          <CardDescription>Lọc theo nguồn service, action hoặc actor/target/reason.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Từ khóa</span>
              <div className="flex items-center gap-2">
                <Search aria-hidden="true" className="text-muted-foreground" />
                <Input
                  name="audit-query"
                  autoComplete="off"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Actor, target, reason..."
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Nguồn</span>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL">Tất cả nguồn</SelectItem>
                    <SelectItem value="CORE_API">CORE_API</SelectItem>
                    <SelectItem value="SUPPORT_API">SUPPORT_API</SelectItem>
                    <SelectItem value="STAFF">STAFF</SelectItem>
                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Action</span>
              <Input name="audit-action" autoComplete="off" value={action} onChange={(event) => setAction(event.target.value.toUpperCase())} placeholder="ACTION" />
            </label>
            <div className="flex items-end">
              <Button onClick={loadLogs} disabled={isLoading} className="w-full lg:w-auto">Áp dụng</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="app-table-card">
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Đang tải nhật ký...</div>
          ) : visibleLogs.length === 0 ? (
            <EmptyState icon="LOG" title="Không có nhật ký phù hợp" className="border-0 shadow-none" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead>Lý do</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLogs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDateTime(item.createdAt || item.timestamp)}</TableCell>
                    <TableCell className="font-mono font-bold">{item.actor || "--"}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold">{item.action}</div>
                      <Badge variant={item.severity === "SECURITY" ? "destructive" : "secondary"}>{item.severity || "INFO"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>{item.targetType || "--"}</div>
                      <div className="font-mono text-xs text-muted-foreground">#{item.targetId || item.id}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{item.sourceService || item.source || "--"}</Badge></TableCell>
                    <TableCell className="max-w-md whitespace-normal">{item.reason || item.detail || "--"}</TableCell>
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
