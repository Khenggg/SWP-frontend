import React, { useState } from "react";
import { FileWarning, Search } from "lucide-react";
import { toast } from "sonner";
import { staffSessionService } from "@/services/staffSessionService";
import { formatDateTime, formatVND } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StaffLostCardPage() {
  const [query, setQuery] = useState("51C-77888");
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({
    reporterName: "",
    phone: "",
    verificationNote: "",
    reason: "",
  });

  const handleSearch = async () => {
    try {
      const found = await staffSessionService.searchActiveSession({ plate: query, cardCode: query });
      setSession(found);
      toast.success(`Đã tìm thấy phiên ${found.sessionCode}`);
    } catch (error) {
      setSession(null);
      toast.error(error.message || "Không tìm thấy phiên.");
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    if (!form.reporterName.trim() || !form.verificationNote.trim() || !form.reason.trim()) {
      toast.error("Nhập đủ người báo mất, ghi chú xác minh và lý do.");
      return;
    }
    try {
      const created = await staffSessionService.createLostCardCase({ ...form, sessionId: session.id });
      toast.success(`Đã tạo hồ sơ ${created.caseCode}, chờ Manager duyệt.`);
      setForm({ reporterName: "", phone: "", verificationNote: "", reason: "" });
    } catch (error) {
      toast.error(error.message || "Không thể tạo hồ sơ.");
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Báo mất thẻ</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Staff tạo hồ sơ mất thẻ tại cổng ra để Manager phê duyệt trước khi cho xe ra.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm phiên cần xử lý</CardTitle>
          <CardDescription>Nhập mã thẻ hoặc biển số xe khách khai báo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="CARD-0099 hoặc 51C-77888" />
            <Button onClick={handleSearch}>
              <Search data-icon="inline-start" />
              Tìm phiên
            </Button>
          </div>
        </CardContent>
      </Card>

      {session && (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Phiên đang hoạt động</CardTitle>
              <CardDescription>{session.sessionCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 text-sm">
                <Row label="Biển số" value={session.plateNumber} />
                <Row label="Thẻ" value={session.cardCode} />
                <Row label="Vào lúc" value={formatDateTime(session.entryTime)} />
                <Row label="Phí mất thẻ" value={formatVND(session.snapshotLostCardFee)} />
                <Badge variant="secondary" className="justify-center rounded-lg py-2">
                  {session.vehicleTypeName}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ mất thẻ</CardTitle>
              <CardDescription>Thông tin này sẽ được đưa vào hàng đợi phê duyệt của Manager.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Người báo mất" value={form.reporterName} onChange={(event) => setForm({ ...form, reporterName: event.target.value })} />
                <Input placeholder="Số điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                <Input className="md:col-span-2" placeholder="Ghi chú xác minh giấy tờ" value={form.verificationNote} onChange={(event) => setForm({ ...form, verificationNote: event.target.value })} />
                <Input className="md:col-span-2" placeholder="Lý do mất thẻ" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
                <Button className="md:col-span-2" onClick={handleSubmit}>
                  <FileWarning data-icon="inline-start" />
                  Tạo hồ sơ chờ duyệt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
