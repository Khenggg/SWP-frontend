import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock, CreditCard, MapPin, ReceiptText } from "lucide-react";
import { publicLookupService } from "@/services/publicLookupService";
import { formatDateTime, formatVND } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";

export default function QRLookupPage() {
  const { qrToken } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setData(await publicLookupService.getCardActiveSession(qrToken));
        setError("");
      } catch (err) {
        setError(err.message || "Không tìm thấy vé đỗ xe đang hoạt động.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [qrToken]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">Đang tra cứu vé đỗ xe...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon="QR"
          title="Không có phiên đỗ xe đang hoạt động"
          description={error || "Thẻ này có thể đã checkout hoặc QR token không hợp lệ."}
        />
      </div>
    );
  }

  const { session, feePreview } = data;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Tra cứu vé đỗ xe</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Thông tin nhanh từ QR in trên thẻ, không cần đăng nhập.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>{session.plateNumber}</span>
            <Badge variant="secondary">{session.status}</Badge>
          </CardTitle>
          <CardDescription>{session.sessionCode}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Metric icon={CreditCard} label="Mã thẻ" value={session.cardCode} />
            <Metric icon={MapPin} label="Vị trí" value={`${session.floorCode} / ${session.areaCode} / ${session.slotCode}`} />
            <Metric icon={Clock} label="Thời gian vào" value={formatDateTime(session.entryTime)} />
            <Metric icon={ReceiptText} label="Phí tạm tính" value={formatVND(feePreview.totalAmount)} strong />
          </div>
          <div className="mt-5 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Thời lượng tạm tính</span>
              <strong>{feePreview.durationHours} giờ</strong>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái thanh toán</span>
              <Badge variant={feePreview.paymentRequired ? "outline" : "secondary"}>
                {feePreview.paymentRequired ? "Chưa thanh toán" : "Không cần thanh toán"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value, strong }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon />
        {label}
      </div>
      <div className={strong ? "mt-2 text-2xl font-black" : "mt-2 font-mono text-lg font-black"}>{value || "--"}</div>
    </div>
  );
}
