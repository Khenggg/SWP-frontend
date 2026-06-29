import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CreditCard,
  ReceiptText,
  RadioTower,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { staffSessionService } from "@/services/staffSessionService";
import { approvalService } from "@/services/approvalService";
import {
  getLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";
import { formatDateTime, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DetailTile, PageShell, PageHeader } from "@/components/layout/PageScaffold";
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
import { Input } from "@/components/ui/input";

function normalizePlate(value) {
  return String(value || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export default function StaffExitPage() {
  const [cardCode, setCardCode] = useState("CARD-0002");
  const [plate, setPlate] = useState("");
  const [session, setSession] = useState(null);
  const [fee, setFee] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceEvent, setDeviceEvent] = useState(null);
  const [mismatchCase, setMismatchCase] = useState(null);
  const [isCreatingMismatch, setIsCreatingMismatch] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const processedEventRef = useRef("");
  const mainContentRef = useRef(null);

  useEffect(() => {
    const scroll = () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    scroll();
    const timer = setTimeout(scroll, 150);
    return () => clearTimeout(timer);
  }, []);

  const loadFee = useCallback(async (targetSession) => {
    if (!targetSession?.id) return null;
    try {
      const preview = await staffSessionService.previewFee(targetSession.id, new Date().toISOString());
      setFee(preview);
      setReceivedAmount(preview.totalAmount ? String(preview.totalAmount) : "0");
      return preview;
    } catch (error) {
      toast.error(error.message || "Không tính được chi phí phiên.");
      return null;
    }
  }, []);

  const runSearch = useCallback(
    async ({ nextCardCode = cardCode, nextPlate = plate } = {}) => {
      const trimmedCard = nextCardCode.trim();
      const trimmedPlate = nextPlate.trim();
      if (!trimmedCard && !trimmedPlate) {
        toast.error("Nhập mã thẻ hoặc biển số để tìm phiên đỗ xe.");
        return;
      }

      setIsLoading(true);
      setMismatchCase(null);
      try {
        const found = await staffSessionService.searchActiveSession({
          cardCode: trimmedCard,
          plate: trimmedPlate,
        });
        setSession(found);
        await loadFee(found);
        
        // Check if there is an existing mismatch case for this session
        try {
          const mismatches = await approvalService.getMismatchCases();
          const matched = mismatches.find((m) => m.sessionId === found.id);
          if (matched) {
            setMismatchCase(matched);
          }
        } catch (err) {
          console.error("Lỗi lấy hồ sơ lệch biển:", err);
        }

        toast.success(`Đã tìm thấy phiên ${found.sessionCode}`);
        setIsCheckoutOpen(true);
      } catch (error) {
        setSession(null);
        setFee(null);
        toast.error(error.message || "Không tìm thấy phiên đỗ xe đang hoạt động.");
      } finally {
        setIsLoading(false);
      }
    },
    [cardCode, loadFee, plate]
  );

  const applyExitDeviceEvent = useCallback(
    async (event) => {
      if (event.gateType !== "EXIT" || processedEventRef.current === event.id) return;

      processedEventRef.current = event.id;
      setDeviceEvent(event);
      setCardCode(event.cardCode || "");
      setPlate(event.detectedPlate || "");
      setReceipt(null);
      setMismatchCase(null);

      if (event.cardCode || event.detectedPlate) {
        await runSearch({
          nextCardCode: event.cardCode || "",
          nextPlate: event.detectedPlate || "",
        });
      } else {
        toast.info("Thiết bị cổng ra đã kết nối nhưng chưa có payload thẻ hoặc biển số.");
      }
    },
    [runSearch]
  );

  useEffect(() => {
    const lastEvent = getLastGateScanEvent();
    if (lastEvent) {
      applyExitDeviceEvent(lastEvent);
    }

    return subscribeGateScanEvents(applyExitDeviceEvent);
  }, [applyExitDeviceEvent]);

  // Polling for mismatch approval status updates from manager
  useEffect(() => {
    if (!session || !mismatchCase || mismatchCase.status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const mismatches = await approvalService.getMismatchCases();
        const matched = mismatches.find((m) => m.id === mismatchCase.id);
        if (matched && matched.status !== mismatchCase.status) {
          setMismatchCase(matched);
          toast.info(`Hồ sơ sự cố ${matched.caseCode} đã được cập nhật thành: ${matched.status}`);
        }
      } catch (err) {
        console.error("Lỗi cập nhật trạng thái hồ sơ:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [session, mismatchCase]);

  // Derived state (no intermediate useState + useEffect) - Vercel Best Practices
  const hasMismatch = useMemo(() => {
    if (!session) return false;
    // Compare entry plate with current plate input (which is mutable and can be corrected by staff)
    return normalizePlate(session.plateNumber) !== normalizePlate(plate);
  }, [plate, session]);

  const paymentReady = useMemo(() => {
    return fee && (!fee.paymentRequired || fee.paymentStatus === "PAID" || session?.paymentStatus === "PAID");
  }, [fee, session]);

  const canExit = useMemo(() => {
    if (!paymentReady) return false;
    // Can exit if plates match, OR if the mismatch has been approved by the manager
    return !hasMismatch || mismatchCase?.status === "APPROVED";
  }, [paymentReady, hasMismatch, mismatchCase]);

  const handleSearch = () => runSearch();

  const handlePayCash = async () => {
    if (!session || !fee) return;
    try {
      await staffSessionService.payCash(session.id, Number(receivedAmount || 0));
      setSession((prev) => prev ? { ...prev, paymentStatus: "PAID" } : null);
      setFee((prev) => prev ? { ...prev, paymentStatus: "PAID" } : null);
      toast.success("Đã ghi nhận thanh toán tiền mặt.");
    } catch (error) {
      toast.error(error.message || "Thanh toán thất bại.");
    }
  };

  const handleCreateMismatchCase = async () => {
    if (!session || !deviceEvent?.detectedPlate) return;
    setIsCreatingMismatch(true);
    try {
      const createdCase = await staffSessionService.createMismatchCase({
        sessionId: session.id,
        exitPlateNumber: deviceEvent.detectedPlate,
        reason: `Thiết bị ${deviceEvent.gateCode} đọc ${deviceEvent.detectedPlate}, khác biển số vào ${session.plateNumber}.`,
      });
      setMismatchCase(createdCase);
      toast.success(`Đã tạo hồ sơ lệch biển số ${createdCase.caseCode}.`);
    } catch (error) {
      toast.error(error.message || "Không thể tạo hồ sơ lệch biển số.");
    } finally {
      setIsCreatingMismatch(false);
    }
  };

  const handleCompleteExit = async () => {
    if (!session || !fee) return;
    try {
      const result = await staffSessionService.completeExit(session.id, {
        exitTime: fee.exitTime,
        exitGateCode: deviceEvent?.gateCode || "GATE-OUT-01",
      });
      setReceipt(result.receipt);
      setSession(null);
      setFee(null);
      setDeviceEvent(null);
      setIsCheckoutOpen(false);
      toast.success("Đã hoàn tất lượt xe ra và giải phóng slot đỗ.");
    } catch (error) {
      toast.error(error.message || "Không thể xác nhận hoàn tất lượt xe ra.");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Staff · Exit desk"
        title="Cổng ra bãi xe"
        description="Quét thẻ hoặc nhập biển số lúc ra để đối chiếu trực quan thông tin vào/ra, thu phí và hoàn tất lượt gửi."
        icon={ReceiptText}
        meta={deviceEvent ? <Badge variant="secondary" className="w-fit rounded-lg font-mono">{deviceEvent.gateCode} / {deviceEvent.scanType}</Badge> : null}
      />

      {deviceEvent && <DeviceBanner event={deviceEvent} />}

      <div ref={mainContentRef} className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr] mt-4">
        {/* Left Column - Real-time camera feeds and snapshot comparison */}
        <div className="flex flex-col gap-4">
          <CameraComparisonFeed
            entryImage={session?.entryVehicleImageDataUrl}
            exitImage={deviceEvent?.vehicleImageDataUrl}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <ComparisonCard
              title="Ảnh chụp biển số"
              entryImage={session?.entryPlateImageDataUrl}
              exitImage={deviceEvent?.plateImageDataUrl}
            />
            <ComparisonCard
              title="Ảnh chân dung tài xế"
              entryImage={session?.entryDriverImageDataUrl}
              exitImage={deviceEvent?.driverImageDataUrl}
            />
          </div>

          <OCRComparisonCard
            entryPlate={session?.plateNumber || ""}
            exitPlate={plate}
            setExitPlate={setPlate}
            hasMismatch={hasMismatch}
            confidence={deviceEvent?.plateConfidence}
          />
        </div>

        {/* Right Column - Controls and Details */}
        <div className="flex flex-col gap-4">
          <Card className="app-card">
            <CardHeader>
              <CardTitle>Tra cứu phiên đỗ xe</CardTitle>
              <CardDescription>Quét thẻ NFC lúc ra hoặc nhập mã thẻ để đối soát thông tin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="app-field-label">Mã thẻ NFC</span>
                  <Input
                    name="exit-card-code"
                    autoComplete="off"
                    spellCheck={false}
                    value={cardCode}
                    onChange={(event) => setCardCode(event.target.value.toUpperCase())}
                    placeholder="CARD-0002…"
                    className="font-mono font-bold"
                  />
                </label>
                <Button onClick={handleSearch} disabled={isLoading} className="h-11">
                  <Search aria-hidden="true" data-icon="inline-start" />
                  Tìm phiên đỗ
                </Button>
              </div>
            </CardContent>
          </Card>

          {session && (
            <Card className="app-card border-slate-300 animate-in fade-in duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Phiên đang xử lý</span>
                  <Badge variant="outline" className={cn(
                    "rounded-md text-[10px] uppercase font-bold",
                    hasMismatch
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : session.paymentStatus === "PAID"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-sky-200 bg-sky-50 text-sky-800"
                  )}>
                    {hasMismatch ? "Lệch biển số" : session.paymentStatus === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                  </Badge>
                </CardTitle>
                <CardDescription className="font-mono tabular-nums">{session.sessionCode}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-xs font-semibold">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Thẻ NFC:</span>
                    <span className="font-mono">{session.cardCode}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Biển số vào:</span>
                    <span className="font-mono">{session.plateNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Biển số ra:</span>
                    <span className="font-mono">{plate || "-- --"}</span>
                  </div>
                </div>

                {hasMismatch && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 text-xs text-amber-900">
                    <p className="font-bold flex items-center gap-1.5 mb-1.5">
                      <ShieldAlert aria-hidden="true" className="size-3.5 text-amber-700" />
                      Lệch biển số ra và biển số vào
                    </p>
                    {mismatchCase ? (
                      <span className="font-mono text-[10px] font-bold bg-white/80 px-1.5 py-0.5 rounded border border-amber-300 block text-center">
                        Đã tạo hồ sơ: {mismatchCase.caseCode} ({mismatchCase.status})
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateMismatchCase}
                        disabled={isCreatingMismatch}
                        className="w-full h-8 text-[11px] font-bold border-amber-300 bg-white hover:bg-amber-100 text-amber-900"
                      >
                        <AlertTriangle aria-hidden="true" className="size-3 mr-1" />
                        Tạo hồ sơ sự cố lệch biển
                      </Button>
                    )}
                  </div>
                )}

                <Button onClick={() => setIsCheckoutOpen(true)} className="w-full h-11 text-sm font-bold shadow-sm">
                  <CreditCard aria-hidden="true" className="size-4 mr-1.5" />
                  Tiến hành thanh toán & Xe ra
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        session={session}
        fee={fee}
        hasMismatch={hasMismatch}
        mismatchCase={mismatchCase}
        isCreatingMismatch={isCreatingMismatch}
        handleCreateMismatchCase={handleCreateMismatchCase}
        receivedAmount={receivedAmount}
        setReceivedAmount={setReceivedAmount}
        handlePayCash={handlePayCash}
        handleCompleteExit={handleCompleteExit}
        canExit={canExit}
      />

      <ReceiptDialog receipt={receipt} setReceipt={setReceipt} />
    </PageShell>
  );
}

function DeviceBanner({ event }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border status-info p-4 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <RadioTower aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" />
        <div>
          <p className="font-black">Thiết bị cổng ra: {event.gateCode}</p>
          <p className="text-xs font-semibold text-sky-800">
            Quét lúc <span className="font-mono tabular-nums">{new Date(event.capturedAt).toLocaleTimeString("vi-VN")}</span> bằng {event.scanType}
          </p>
        </div>
      </div>
      <div className="font-mono text-xs font-black rounded bg-sky-100/80 px-2 py-1 text-sky-900">
        {event.cardCode || event.qrToken || event.detectedPlate || "No payload"}
      </div>
    </div>
  );
}

function CameraComparisonFeed({ entryImage, exitImage }) {
  return (
    <Card className="app-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Camera aria-hidden="true" className="size-4" />
          Camera làn xe (Đối chiếu toàn cảnh)
        </CardTitle>
        <CardDescription>So sánh xe lúc vào bãi và lúc ra bãi để kiểm tra màu sắc, kiểu dáng.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Entry Feed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Ảnh lúc vào bãi</span>
              {entryImage && <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-800">Đã lưu</Badge>}
            </div>
            <div className="flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-slate-400">
              {entryImage ? (
                <img src={entryImage} alt="Camera làn vào" width="480" height="240" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500">Không có dữ liệu ảnh xe vào…</span>
              )}
            </div>
          </div>
          {/* Exit Feed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Ảnh lúc ra bãi (Hiện tại)</span>
              {exitImage && <Badge variant="outline" className="text-[10px] border-sky-200 bg-sky-50 text-sky-800 animate-pulse">Live</Badge>}
            </div>
            <div className="flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-slate-400">
              {exitImage ? (
                <img src={exitImage} alt="Camera làn ra" width="480" height="240" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500 animate-pulse">Chờ tín hiệu từ camera exit…</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonCard({ title, entryImage, exitImage }) {
  return (
    <Card className="app-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 grid-cols-2">
          {/* Entry column */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-wide text-muted-foreground">Lúc vào</span>
            <div className="flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-slate-400">
              {entryImage ? (
                <img src={entryImage} alt={`${title} lúc vào`} width="240" height="120" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[9px] font-bold text-slate-500">Không có ảnh</span>
              )}
            </div>
          </div>
          {/* Exit column */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-wide text-muted-foreground">Lúc ra</span>
            <div className="flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-slate-400">
              {exitImage ? (
                <img src={exitImage} alt={`${title} lúc ra`} width="240" height="120" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[9px] font-bold text-slate-500">Chờ thiết bị</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OCRComparisonCard({ entryPlate, exitPlate, setExitPlate, hasMismatch, confidence }) {
  return (
    <Card className="app-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold">Đối soát biển số xe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 items-center">
          <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>Biển số vào</span>
              <span>Đăng ký</span>
            </div>
            <div className="font-mono text-xl font-black text-center py-2 bg-background border rounded">{entryPlate || "-- --"}</div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>Biển số ra</span>
              <span className="font-mono tabular-nums">{confidence ? `OCR ${confidence}%` : "Nhập tay"}</span>
            </div>
            <Input
              name="exit-plate-correction"
              value={exitPlate}
              onChange={(event) => setExitPlate(event.target.value.toUpperCase())}
              placeholder="Chờ quét / Nhập tay…"
              autoComplete="off"
              spellCheck={false}
              className={`font-mono text-xl font-black text-center h-11 border rounded focus-visible:ring-2 ${
                hasMismatch
                  ? "bg-red-50 text-red-700 border-red-200 focus-visible:ring-red-300"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 focus-visible:ring-emerald-300"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckoutDialog({
  open,
  onOpenChange,
  session,
  fee,
  hasMismatch,
  mismatchCase,
  isCreatingMismatch,
  handleCreateMismatchCase,
  receivedAmount,
  setReceivedAmount,
  handlePayCash,
  handleCompleteExit,
  canExit,
}) {
  if (!session || !fee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <CreditCard aria-hidden="true" className="size-5 text-primary" />
            Thanh toán & Hoàn tất lượt xe ra
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Mã phiên: {session.sessionCode}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 py-2">
          {/* Left Side: Session Entry Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Thông tin xe vào</h4>
            <div className="grid gap-2.5 rounded-lg border bg-muted/20 p-3.5 text-xs font-semibold">
              <DetailTile label="Biển số vào" value={session.plateNumber} mono />
              <DetailTile label="Thẻ NFC" value={session.cardCode} mono />
              <DetailTile label="Loại xe" value={session.vehicleTypeName} />
              <DetailTile label="Khách hàng" value={session.customerType === "MONTHLY" ? "Vé tháng" : "Vãng lai"} />
              <div className="col-span-2 border-t pt-2 mt-1">
                <p className="text-[10px] text-muted-foreground mb-0.5">Thời điểm vào bãi</p>
                <p className="font-mono text-foreground">{formatDateTime(session.entryTime)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-muted-foreground mb-0.5">Vị trí đỗ xe</p>
                <p className="text-foreground">{session.floorCode} / {session.areaCode} / {session.slotCode}</p>
              </div>
            </div>
          </div>

          {/* Right Side: Payment and exit action */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Thanh toán & Phí đỗ xe</h4>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-muted/40 p-4 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Thời lượng đỗ</span>
                  <strong className="tabular-nums">{fee.durationHours} giờ</strong>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Đơn giá áp dụng</span>
                  <strong className="tabular-nums">{formatVND(fee.rate)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm font-bold">
                  <span>Tổng tiền thu</span>
                  <span className="text-xl font-black text-primary tabular-nums">{formatVND(fee.totalAmount)}</span>
                </div>
              </div>

              {!fee.paymentRequired ? (
                <Badge variant="secondary" className="justify-center rounded-md py-2.5 border border-emerald-100 bg-emerald-50 text-emerald-800 font-bold text-sm">
                  <ShieldCheck aria-hidden="true" data-icon="inline-start" className="size-4 mr-1 text-emerald-700" />
                  {fee.waiveReason || "Không cần thanh toán"}
                </Badge>
              ) : (
                <label className="flex flex-col gap-2">
                  <span className="app-field-label text-xs">Số tiền khách đưa (VND)</span>
                  <Input
                    name="modal-received-amount"
                    autoComplete="off"
                    value={receivedAmount}
                    onChange={(event) => setReceivedAmount(event.target.value)}
                    inputMode="numeric"
                    className="font-mono text-lg font-bold"
                  />
                  <Button variant="outline" onClick={handlePayCash} className="h-10 border-slate-300">
                    <CreditCard aria-hidden="true" className="size-4 mr-1.5" />
                    Xác nhận thu tiền mặt
                  </Button>
                </label>
              )}

              {hasMismatch && (
                <div className="rounded-lg border status-warning p-3 text-[11px] font-semibold text-amber-800 bg-amber-50 border-amber-100">
                  <p className="flex items-center gap-1 mb-1 font-bold">
                    <ShieldAlert aria-hidden="true" className="size-3.5 text-amber-700" />
                    Cảnh báo: Biển số bị lệch
                  </p>
                  {mismatchCase ? (
                    <span>Hồ sơ sự cố: {mismatchCase.caseCode} ({mismatchCase.status}). Cần Quản lý duyệt trước khi cho ra.</span>
                  ) : (
                    <div className="space-y-2">
                      <p>Biển số ra không khớp biển số vào. Vui lòng đóng modal đối soát hình ảnh hoặc bấm bên dưới để tạo sự cố.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateMismatchCase}
                        disabled={isCreatingMismatch}
                        className="w-full h-8 text-[11px] font-bold border-amber-300 hover:bg-amber-100 text-amber-900 bg-white"
                      >
                        Tạo hồ sơ sự cố lệch biển
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Quay lại đối soát
          </Button>
          <Button onClick={handleCompleteExit} disabled={!canExit} className="w-full sm:w-auto">
            <ReceiptText aria-hidden="true" className="size-4 mr-1.5" />
            Xác nhận xe ra bãi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptDialog({ receipt, setReceipt }) {
  return (
    <Dialog open={Boolean(receipt)} onOpenChange={(open) => !open && setReceipt(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Biên lai đỗ xe thành công</DialogTitle>
          <DialogDescription>Thẻ và vị trí đỗ đã được giải phóng trên hệ thống.</DialogDescription>
        </DialogHeader>
        {receipt && (
          <div className="rounded-lg border bg-muted/20 p-4 font-mono text-sm space-y-2.5">
            <ReceiptLine label="Mã biên lai" value={receipt.receiptCode} />
            <ReceiptLine label="Biển số xe" value={receipt.plateNumber} />
            <ReceiptLine label="Mã thẻ NFC" value={receipt.cardCode} />
            <ReceiptLine label="Thời điểm vào" value={formatDateTime(receipt.entryTime)} />
            <ReceiptLine label="Thời điểm ra" value={formatDateTime(receipt.exitTime)} />
            <div className="mt-4 flex justify-between border-t pt-3 text-base font-bold">
              <span>Tổng tiền thanh toán</span>
              <span className="text-lg text-primary tabular-nums">{formatVND(receipt.totalAmount)}</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setReceipt(null)} className="w-full sm:w-auto">Đóng biên lai</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptLine({ label, value }) {
  return (
    <div className="flex justify-between text-xs font-medium border-b border-dashed border-slate-200 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
