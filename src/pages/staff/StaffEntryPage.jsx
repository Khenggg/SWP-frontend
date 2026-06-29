import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  ImageIcon,
  Maximize2,
  QrCode,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { bookingService } from "../../services/bookingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";
import { cn } from "@/lib/utils";

const emptyDeviceDraft = {
  cardCode: "",
  plate: "",
  vehicleTypeName: "Xe Máy",
  gateCode: "GATE-IN-01",
  plateConfidence: 0,
  plateImageDataUrl: "",
  vehicleImageDataUrl: "",
  driverImageDataUrl: "",
};

const initialBookingScan = {
  requestedId: "",
  status: "idle",
  message: "Chưa có QR đặt chỗ từ thiết bị.",
};

const vehicleTypes = ["Xe Máy", "Ô Tô", "Xe Đạp", "Xe Vận Chuyển"];

function normalizeBookingId(value) {
  const token = String(value || "").trim();
  if (!token) return "";
  return token.replace(/^booking-/i, "").toUpperCase();
}

function isBookingQrValue(value) {
  return /^BK-\d+/i.test(normalizeBookingId(value));
}

function getSimNow() {
  const saved = localStorage.getItem("driver_sim_time");
  const date = saved ? new Date(saved) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function addMinutes(value, minutes) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function getBookingWindow(booking) {
  if (!booking) return null;
  if (booking.status !== "PAID") {
    return {
      variant: "invalid",
      label: "Không hợp lệ",
      message: `Booking đang ở trạng thái ${booking.status || "không xác định"}.`,
    };
  }

  const paidAt = booking.paidAt || booking.createdAt;
  const durationMins = Number(booking.hours || 0) * 60;
  const checkInExpiry = addMinutes(paidAt, durationMins);
  const graceExpiry = checkInExpiry ? addMinutes(checkInExpiry, 15) : null;
  const warningStart = checkInExpiry ? addMinutes(checkInExpiry, -15) : null;
  const now = getSimNow();

  if (!checkInExpiry || !graceExpiry || !warningStart) {
    return {
      variant: "valid",
      label: "Đã thanh toán",
      message: "Booking đã thanh toán, chưa có đủ dữ liệu thời hạn.",
    };
  }

  if (now > graceExpiry) {
    return {
      variant: "expired",
      label: "Quá hạn",
      message: "Booking đã quá thời hạn check-in và 15 phút gia hạn.",
      checkInExpiry,
      graceExpiry,
    };
  }

  if (now > checkInExpiry) {
    const minsLeft = Math.max(0, Math.ceil((graceExpiry.getTime() - now.getTime()) / 60000));
    return {
      variant: "grace",
      label: "Đang gia hạn",
      message: `Đã trễ giờ check-in, còn ${minsLeft} phút gia hạn.`,
      checkInExpiry,
      graceExpiry,
    };
  }

  if (now >= warningStart) {
    const minsLeft = Math.max(0, Math.ceil((checkInExpiry.getTime() - now.getTime()) / 60000));
    return {
      variant: "warning",
      label: "Sắp hết hạn",
      message: `Còn ${minsLeft} phút trước thời hạn check-in.`,
      checkInExpiry,
      graceExpiry,
    };
  }

  const minsLeft = Math.max(0, Math.ceil((checkInExpiry.getTime() - now.getTime()) / 60000));
  return {
    variant: "valid",
    label: "Còn hạn",
    message: `Còn ${minsLeft} phút trước thời hạn check-in.`,
    checkInExpiry,
    graceExpiry,
  };
}

function getStatusTone(variant) {
  switch (variant) {
    case "valid":
    case "done":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
    case "grace":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "expired":
    case "invalid":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default function StaffEntryPage() {
  const [paidBookings, setPaidBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingScan, setBookingScan] = useState(initialBookingScan);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deviceDraft, setDeviceDraft] = useState(emptyDeviceDraft);
  const [lastDeviceEvent, setLastDeviceEvent] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const processedEventRef = useRef("");

  const selectedBookingWindow = useMemo(() => getBookingWindow(selectedBooking), [selectedBooking]);
  const hasUsableBooking = Boolean(
    selectedBooking &&
      selectedBookingWindow &&
      !["expired", "invalid"].includes(selectedBookingWindow.variant)
  );

  const loadPaidBookings = useCallback(async (preferredBookingId = "") => {
    setIsBookingLoading(true);
    try {
      const data = await bookingService.getPaidBookingsForStaff();
      const normalizedId = normalizeBookingId(preferredBookingId);
      let matchedBooking = normalizedId
        ? data.find((booking) => normalizeBookingId(booking.id) === normalizedId)
        : null;

      if (normalizedId && !matchedBooking) {
        try {
          matchedBooking = await bookingService.getBookingForStaff(normalizedId);
        } catch (error) {
          matchedBooking = null;
        }
      }

      setPaidBookings(data);
      if (normalizedId) {
        setSelectedBookingId(matchedBooking?.id || "");
        setSelectedBooking(matchedBooking || null);
      }

      return { data, matchedBooking };
    } catch (error) {
      console.error("Lỗi lấy danh sách đặt giữ chỗ:", error);
      toast.error("Không tải được danh sách booking đã thanh toán.");
      return { data: [], matchedBooking: null };
    } finally {
      setIsBookingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaidBookings();
  }, [loadPaidBookings]);

  const applyEntryDeviceEvent = useCallback(
    async (event) => {
      if (event.gateType !== "ENTRY" || processedEventRef.current === event.id) return;

      processedEventRef.current = event.id;
      const requestedBookingId = normalizeBookingId(event.bookingId || event.qrToken);
      const hasBookingQrPayload = isBookingQrValue(requestedBookingId);
      const displayEvent = hasBookingQrPayload
        ? { ...event, scanType: "BOOKING_QR", cardCode: "", bookingId: requestedBookingId, qrToken: "" }
        : event;
      setLastDeviceEvent(displayEvent);
      setSuccessMsg("");
      setDeviceDraft((current) => ({
        ...current,
        cardCode: hasBookingQrPayload ? current.cardCode || "" : event.cardCode || current.cardCode || "",
        plate: event.detectedPlate || current.plate || "",
        vehicleTypeName: event.vehicleTypeName || current.vehicleTypeName || "Xe Máy",
        gateCode: event.gateCode || current.gateCode || "GATE-IN-01",
        plateConfidence: event.plateConfidence || current.plateConfidence || 0,
        plateImageDataUrl: event.plateImageDataUrl || current.plateImageDataUrl || "",
        vehicleImageDataUrl: event.vehicleImageDataUrl || current.vehicleImageDataUrl || "",
        driverImageDataUrl: event.driverImageDataUrl || current.driverImageDataUrl || "",
      }));

      if (event.scanType === "BOOKING_QR" || hasBookingQrPayload) {
        if (!requestedBookingId) {
          setBookingScan({
            requestedId: "",
            status: "invalid",
            message: "Thiết bị gửi QR nhưng không có mã booking.",
          });
          toast.warning("QR từ thiết bị không có mã booking để đối chiếu.");
          return;
        }

        setBookingScan({
          requestedId: requestedBookingId,
          status: "checking",
          message: `Đang đối chiếu QR ${requestedBookingId} với danh sách booking đã thanh toán.`,
        });

        const { matchedBooking } = await loadPaidBookings(requestedBookingId);
        if (!matchedBooking) {
          setBookingScan({
            requestedId: requestedBookingId,
            status: "not-found",
            message: "Không có trong danh sách booking đã thanh toán/chờ vào. Có thể sai mã, chưa thanh toán, đã dùng hoặc quá hạn.",
          });
          toast.warning(`QR ${requestedBookingId} không khớp booking đang chờ vào.`);
          return;
        }

        setDeviceDraft((current) => ({
          ...current,
          vehicleTypeName: event.vehicleTypeName || matchedBooking.vehicleTypeName || current.vehicleTypeName,
          plate: event.detectedPlate || matchedBooking.plate || current.plate,
        }));

        const windowInfo = getBookingWindow(matchedBooking);
        setBookingScan({
          requestedId: matchedBooking.id,
          status: windowInfo?.variant === "expired" ? "expired" : "matched",
          message: windowInfo?.message || "Booking đã được tìm thấy.",
        });

        if (windowInfo?.variant === "expired") {
          toast.warning(`Booking ${matchedBooking.id} đã quá hạn. Staff có thể bỏ booking và xử lý vãng lai.`);
        } else {
          toast.success(`Đã xác minh booking ${matchedBooking.id}. Tiếp tục quét/gán thẻ NFC.`);
        }
        return;
      }

      if (event.scanType === "CARD") {
        toast.success(`Đã nhận thẻ ${event.cardCode || "N/A"} từ thiết bị.`);
        return;
      }

      toast.info("Đã nhận dữ liệu camera/OCR từ thiết bị cổng vào.");
    },
    [loadPaidBookings]
  );

  useEffect(() => {
    const lastEvent = getLastGateScanEvent("ENTRY");
    if (lastEvent) {
      applyEntryDeviceEvent(lastEvent);
    }

    return subscribeGateScanEvents(applyEntryDeviceEvent);
  }, [applyEntryDeviceEvent]);

  const handleBookingChange = (id) => {
    const booking = paidBookings.find((item) => item.id === id) || (selectedBooking?.id === id ? selectedBooking : null);
    setSelectedBookingId(booking?.id || "");
    setSelectedBooking(booking);
    setBookingScan(
      booking
        ? {
            requestedId: booking.id,
            status: "matched",
            message: "Booking được Staff chọn thủ công để đối chiếu.",
          }
        : initialBookingScan
    );
    if (booking) {
      setDeviceDraft((current) => ({
        ...current,
        vehicleTypeName: booking.vehicleTypeName || current.vehicleTypeName,
        plate: current.plate || booking.plate || "",
      }));
    }
  };

  const clearBooking = () => {
    setSelectedBookingId("");
    setSelectedBooking(null);
    setBookingScan(initialBookingScan);
  };

  const refreshBookings = async () => {
    const preferredId = bookingScan.requestedId || selectedBookingId;
    const { matchedBooking } = await loadPaidBookings(preferredId);
    if (preferredId && !matchedBooking) {
      setBookingScan({
        requestedId: preferredId,
        status: "not-found",
        message: "Booking không còn trong danh sách chờ vào sau khi tải lại.",
      });
    }
  };

  const handleConfirmEntry = async () => {
    if (!deviceDraft.cardCode.trim()) {
      toast.error("Vui lòng quét hoặc nhập mã thẻ NFC trước khi xác nhận.");
      return;
    }
    if (!deviceDraft.plate.trim()) {
      toast.error("Vui lòng nhập biển số xe thực tế.");
      return;
    }

    if (false && !selectedBooking) {
      setSuccessMsg(`Dữ liệu thẻ ${deviceDraft.cardCode.trim().toUpperCase()} đã sẵn sàng cho lượt vào vãng lai.`);
      toast.info("Luồng vãng lai đã sẵn sàng. API tạo phiên vào bãi sẽ nối ở phase backend tiếp theo.");
      return;
    }

    if (selectedBooking && !hasUsableBooking) {
      toast.error("Booking không còn hợp lệ để gắn vào lượt vào. Hãy bỏ booking hoặc xử lý ngoại lệ.");
      return;
    }

    setIsConfirming(true);
    setSuccessMsg("");
    try {
      const entryPayload = {
        cardCode: deviceDraft.cardCode.trim(),
        plate: deviceDraft.plate.trim(),
        vehicleTypeName: deviceDraft.vehicleTypeName,
        gateCode: deviceDraft.gateCode,
        plateConfidence: deviceDraft.plateConfidence,
        plateImageDataUrl: deviceDraft.plateImageDataUrl,
        vehicleImageDataUrl: deviceDraft.vehicleImageDataUrl,
        driverImageDataUrl: deviceDraft.driverImageDataUrl,
      };
      const result = selectedBooking
        ? await bookingService.confirmBookingScan(selectedBooking.id, entryPayload)
        : await bookingService.createCasualEntry(entryPayload);
      const session = result?.session || result;

      if (!selectedBooking) {
        setSuccessMsg(`ÄÃ£ táº¡o phiÃªn ${session?.sessionCode || ""} cho xe vÃ£ng lai. Test xe ra báº±ng tháº» ${deviceDraft.cardCode.trim().toUpperCase()}.`);
        setDeviceDraft(emptyDeviceDraft);
        setLastDeviceEvent(null);
        setSelectedBookingId("");
        setSelectedBooking(null);
        setBookingScan(initialBookingScan);
        await loadPaidBookings();
        return;
      }
      setSuccessMsg(`Đã gán thẻ ${deviceDraft.cardCode.trim().toUpperCase()} và xác nhận xe vào bãi cho booking ${selectedBooking.id}.`);
      setDeviceDraft(emptyDeviceDraft);
      setLastDeviceEvent(null);
      setSelectedBookingId("");
      setSelectedBooking(null);
      setBookingScan(initialBookingScan);
      await loadPaidBookings();
    } catch (error) {
      toast.error(error.message || "Xác nhận xe vào bãi thất bại.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="flex h-auto flex-col gap-3 pb-24 lg:pb-0">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CarFront className="text-primary" />
            <h1 className="truncate text-2xl font-black text-foreground">Cổng vào bãi xe</h1>
          </div>
          <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-muted-foreground">
            Thiết bị ngoài gửi QR/NFC/OCR; Staff xem tóm tắt, gắn thẻ NFC và xác nhận trong một khung vận hành.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Badge variant="secondary" className="w-fit rounded-lg px-3 py-1 font-mono">
            {deviceDraft.gateCode}
          </Badge>
          {lastDeviceEvent && (
            <Badge variant="outline" className="w-fit rounded-lg px-3 py-1 font-mono">
              {lastDeviceEvent.scanType}
            </Badge>
          )}
        </div>
      </header>

      <DeviceStrip event={lastDeviceEvent} successMsg={successMsg} />

      <div className="grid min-h-0 gap-3 lg:h-[calc(100dvh-13rem)] lg:min-h-[520px] lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <section className="flex min-h-0 min-w-0 flex-col gap-3">
          <CameraFeed
            title="Camera làn vào"
            image={deviceDraft.vehicleImageDataUrl}
            onPreview={() => setPreviewImage({ title: "Camera làn vào", image: deviceDraft.vehicleImageDataUrl })}
          />

          <div className="grid shrink-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(15rem,0.9fr)]">
            <SnapshotTile
              title="Ảnh biển số"
              image={deviceDraft.plateImageDataUrl}
              onPreview={() => setPreviewImage({ title: "Ảnh biển số", image: deviceDraft.plateImageDataUrl })}
            />
            <SnapshotTile
              title="Ảnh người lái"
              image={deviceDraft.driverImageDataUrl}
              onPreview={() => setPreviewImage({ title: "Ảnh người lái", image: deviceDraft.driverImageDataUrl })}
            />
            <RecognitionPanel draft={deviceDraft} />
          </div>
        </section>

        <CommandPanel
          bookingScan={bookingScan}
          paidBookings={paidBookings}
          selectedBookingId={selectedBookingId}
          selectedBooking={selectedBooking}
          selectedBookingWindow={selectedBookingWindow}
          isBookingLoading={isBookingLoading}
          deviceDraft={deviceDraft}
          setDeviceDraft={setDeviceDraft}
          hasUsableBooking={hasUsableBooking}
          isConfirming={isConfirming}
          onBookingChange={handleBookingChange}
          onRefresh={refreshBookings}
          onClearBooking={clearBooking}
          onOpenBookingDetails={() => setIsBookingDetailsOpen(true)}
          onConfirm={handleConfirmEntry}
        />
      </div>

      <BookingDetailsDialog
        open={isBookingDetailsOpen}
        onOpenChange={setIsBookingDetailsOpen}
        booking={selectedBooking}
        windowInfo={selectedBookingWindow}
      />
      <ImagePreviewDialog preview={previewImage} onOpenChange={(open) => !open && setPreviewImage(null)} />
    </div>
  );
}

function DeviceStrip({ event, successMsg }) {
  if (successMsg) {
    return (
      <div className="flex shrink-0 items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
        <CheckCircle2 className="mt-0.5 shrink-0" />
        <span className="line-clamp-2">{successMsg}</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          <RadioTower className="shrink-0 text-muted-foreground" />
          <span className="truncate font-bold text-muted-foreground">Đang chờ tín hiệu từ thiết bị cổng vào</span>
        </div>
        <Badge variant="outline">READY</Badge>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-950 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <RadioTower className="shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-black">Dữ liệu từ thiết bị giả lập</p>
          <p className="truncate text-xs font-semibold text-cyan-800">
            {event.gateCode} gửi {event.scanType} lúc {formatDateTime(event.capturedAt)}
          </p>
        </div>
      </div>
      <div className="truncate font-mono text-xs font-black">
        {event.cardCode || event.bookingId || event.qrToken || event.detectedPlate || "--"}
      </div>
    </div>
  );
}

function CameraFeed({ title, image, onPreview }) {
  return (
    <Card className="min-h-0 flex-1 bg-slate-950 text-white">
      <CardContent className="h-full p-0">
        <button
          type="button"
          onClick={onPreview}
          className="relative flex h-full min-h-[18rem] w-full items-center justify-center overflow-hidden text-left lg:min-h-0"
        >
          {image ? (
            <img src={image} alt={title} width="960" height="540" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Camera className="size-12" />
              <p className="font-mono text-xs font-bold uppercase tracking-widest">Camera feed stream</p>
            </div>
          )}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-black/55 px-2 py-1 text-xs font-black">
            <span className="size-2 rounded-full bg-red-500" />
            REC
          </div>
          <div className="absolute right-4 top-4 rounded-md bg-black/45 p-2">
            <Maximize2 />
          </div>
        </button>
      </CardContent>
    </Card>
  );
}

function SnapshotTile({ title, image, onPreview }) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-3">
        <button type="button" onClick={onPreview} className="flex w-full min-w-0 items-center gap-3 text-left">
          <div className="flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
            {image ? (
              <img src={image} alt={title} width="160" height="90" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-black">{title}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {image ? "Bấm để xem lớn" : "Chưa có ảnh"}
            </p>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}

function RecognitionPanel({ draft }) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex h-full items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase text-muted-foreground">OCR biển số</p>
          <p className="truncate font-mono text-2xl font-black">{draft.plate || "-- --"}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {draft.vehicleTypeName} · {draft.plateConfidence || 0}% · {draft.gateCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CommandPanel({
  bookingScan,
  paidBookings,
  selectedBookingId,
  selectedBooking,
  selectedBookingWindow,
  isBookingLoading,
  deviceDraft,
  setDeviceDraft,
  hasUsableBooking,
  isConfirming,
  onBookingChange,
  onRefresh,
  onClearBooking,
  onOpenBookingDetails,
  onConfirm,
}) {
  const isBookingExpired = selectedBookingWindow && ["expired", "invalid"].includes(selectedBookingWindow.variant);
  const bookingOptions = selectedBooking && !paidBookings.some((booking) => booking.id === selectedBooking.id)
    ? [selectedBooking, ...paidBookings]
    : paidBookings;
  const bookingState = selectedBooking
    ? selectedBookingWindow?.variant || "valid"
    : bookingScan.status === "not-found" || bookingScan.status === "invalid"
      ? "warning"
      : "idle";

  return (
    <Card className="min-h-0 min-w-0 overflow-hidden">
      <CardHeader className="shrink-0 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Control desk</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Tất cả tín hiệu quyết định vào bãi trong một khung.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onRefresh} aria-label="Tải lại booking">
            <RefreshCw />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4 lg:overflow-hidden">
        <div className="grid shrink-0 gap-2 sm:grid-cols-3">
          <StatusTile
            icon={QrCode}
            label="Booking"
            value={selectedBooking?.id || bookingScan.requestedId || "Không có"}
            detail={selectedBooking ? selectedBookingWindow?.label : bookingScan.status === "not-found" ? "Không khớp" : "Tùy chọn"}
            tone={bookingState}
          />
          <StatusTile
            icon={CreditCard}
            label="Thẻ NFC"
            value={deviceDraft.cardCode || "Chờ thẻ"}
            detail={deviceDraft.cardCode ? "Đã nhận" : "Bắt buộc"}
            tone={deviceDraft.cardCode ? "done" : "idle"}
          />
          <StatusTile
            icon={CarFront}
            label="Biển số"
            value={deviceDraft.plate || "Chưa có"}
            detail={deviceDraft.plate ? `${deviceDraft.plateConfidence || 0}% OCR` : "Bắt buộc"}
            tone={deviceDraft.plate ? "done" : "idle"}
          />
        </div>

        <div className="grid shrink-0 gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <Field label="Booking QR">
            {bookingOptions.length === 0 ? (
              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                Không có booking đang chờ.
              </div>
            ) : (
              <Select value={selectedBookingId || undefined} onValueChange={onBookingChange}>
                <SelectTrigger className="w-full font-mono">
                  <SelectValue placeholder="Không gắn booking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {bookingOptions.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.id} ({booking.username} - {booking.vehicleTypeName} - {booking.status})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </Field>
          <div className="flex items-end gap-2">
            <Button type="button" variant="outline" disabled={!selectedBooking} onClick={onOpenBookingDetails}>
              <QrCode data-icon="inline-start" />
              Chi tiết
            </Button>
            {selectedBooking && (
              <Button type="button" variant="ghost" onClick={onClearBooking}>
                <XCircle data-icon="inline-start" />
                Bỏ
              </Button>
            )}
          </div>
        </div>

        <BookingCompactSummary
          bookingScan={bookingScan}
          selectedBooking={selectedBooking}
          selectedBookingWindow={selectedBookingWindow}
          isLoading={isBookingLoading}
        />

        {isBookingExpired && (
          <ExpiredBookingDecision
            booking={selectedBooking}
            windowInfo={selectedBookingWindow}
            onClearBooking={onClearBooking}
            onOpenBookingDetails={onOpenBookingDetails}
          />
        )}

        <div className="grid shrink-0 gap-3 sm:grid-cols-2">
          <Field label="Mã thẻ NFC">
            <Input
              value={deviceDraft.cardCode}
              onChange={(event) => setDeviceDraft((current) => ({ ...current, cardCode: event.target.value.toUpperCase() }))}
              placeholder="CARD-0002"
              className="font-mono font-bold"
            />
          </Field>
          <Field label="Biển số xe">
            <Input
              value={deviceDraft.plate}
              onChange={(event) => setDeviceDraft((current) => ({ ...current, plate: event.target.value.toUpperCase() }))}
              placeholder="51A-12345"
              className="font-mono font-bold"
            />
          </Field>
          <Field label="Loại xe">
            <Select
              value={deviceDraft.vehicleTypeName}
              onValueChange={(value) => setDeviceDraft((current) => ({ ...current, vehicleTypeName: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <p className="text-xs font-black uppercase text-emerald-700">Slot/gate</p>
            <p className="truncate font-mono text-lg font-black text-emerald-800">
              {selectedBooking?.internalSlotCode || "B1-A / AUTO"}
            </p>
            <p className="truncate text-xs font-semibold text-emerald-700">
              {selectedBooking ? "Slot đã giữ theo booking" : deviceDraft.gateCode}
            </p>
          </div>
        </div>

        {false && isBookingExpired && (
          <div className="flex shrink-0 gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-800">
            <AlertTriangle className="shrink-0" />
            <span>Booking không còn hợp lệ để gắn vào phiên. Bỏ booking để xử lý như khách vãng lai.</span>
          </div>
        )}

        <div className="mt-auto grid shrink-0 gap-2 border-t pt-3 sm:grid-cols-[1fr_auto]">
          <Button
            onClick={onConfirm}
            disabled={isConfirming || Boolean(selectedBooking && !hasUsableBooking)}
            className="h-11"
          >
            {isConfirming ? (
              <>
                <RefreshCw data-icon="inline-start" className="animate-spin" />
                Đang xác nhận...
              </>
            ) : (
              <>
                <CheckCircle2 data-icon="inline-start" />
                {selectedBooking ? "Gắn booking và cho vào" : "Cho vào vãng lai"}
              </>
            )}
          </Button>
          {false && isBookingExpired && (
            <Button type="button" variant="outline" onClick={onClearBooking}>
              <ShieldCheck data-icon="inline-start" />
              Vãng lai
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ExpiredBookingDecision({ booking, windowInfo, onClearBooking, onOpenBookingDetails }) {
  return (
    <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 p-3 text-red-900">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black">Xử lý booking quá hạn</p>
            <p className="mt-1 text-xs font-semibold leading-5">
              {booking?.id || "Booking"} không còn hợp lệ để gắn vào phiên. Chuyển sang vãng lai sẽ bỏ booking này,
              giữ lại biển số/OCR và cho Staff quét thẻ NFC như khách không đặt trước.
            </p>
            <p className="mt-1 truncate text-xs font-bold text-red-700">
              {windowInfo?.message || "Booking đã quá hạn check-in."}
            </p>
          </div>
        </div>
        <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:w-64">
          <Button type="button" variant="destructive" onClick={onClearBooking} className="h-10">
            <ShieldCheck data-icon="inline-start" />
            Chuyển vãng lai
          </Button>
          <Button type="button" variant="outline" onClick={onOpenBookingDetails} className="h-10 border-red-200 bg-white">
            <QrCode data-icon="inline-start" />
            Chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusTile({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className={cn("min-w-0 rounded-xl border p-3", getStatusTone(tone))}>
      <div className="flex items-center gap-2">
        <Icon className="shrink-0" />
        <span className="text-xs font-black uppercase">{label}</span>
      </div>
      <p className="mt-2 truncate font-mono text-base font-black">{value}</p>
      <p className="truncate text-xs font-semibold">{detail}</p>
    </div>
  );
}

function BookingCompactSummary({ bookingScan, selectedBooking, selectedBookingWindow, isLoading }) {
  if (isLoading || bookingScan.status === "checking") {
    return (
      <div className="shrink-0 rounded-xl border bg-muted/40 p-3 text-sm font-semibold text-muted-foreground">
        Đang tải và đối chiếu booking...
      </div>
    );
  }

  if (!selectedBooking) {
    const isProblem = bookingScan.status === "not-found" || bookingScan.status === "invalid";
    return (
      <div className={cn("flex shrink-0 gap-2 rounded-xl border p-3 text-xs font-semibold leading-5", isProblem ? "border-amber-200 bg-amber-50 text-amber-800" : "bg-muted/35 text-muted-foreground")}>
        {isProblem ? <AlertTriangle className="shrink-0" /> : <Clock3 className="shrink-0" />}
        <span>{isProblem ? `QR ${bookingScan.requestedId || "thiết bị gửi"} không hợp lệ. Có thể xử lý vãng lai bằng NFC.` : "Chưa có booking QR. Khách vãng lai chỉ cần NFC và biển số."}</span>
      </div>
    );
  }

  return (
    <div className={cn("shrink-0 rounded-xl border p-3", getStatusTone(selectedBookingWindow?.variant || "valid"))}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-lg font-black">{selectedBooking.id}</p>
          <p className="truncate text-xs font-semibold">
            {selectedBooking.username} · {selectedBooking.vehicleTypeName} · {selectedBooking.internalSlotCode}
          </p>
        </div>
        <Badge variant="outline" className={cn("shrink-0 rounded-md", getStatusTone(selectedBookingWindow?.variant || "valid"))}>
          {selectedBookingWindow?.label || selectedBooking.status}
        </Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-semibold">{selectedBookingWindow?.message}</p>
    </div>
  );
}

function BookingDetailsDialog({ open, onOpenChange, booking, windowInfo }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết booking</DialogTitle>
          <DialogDescription>Thông tin đối chiếu QR đặt chỗ trước khi gắn thẻ NFC.</DialogDescription>
        </DialogHeader>

        {booking ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailBox label="Mã booking" value={booking.id} mono />
            <DetailBox label="Trạng thái" value={windowInfo?.label || booking.status} />
            <DetailBox label="Người đặt chỗ" value={booking.username} />
            <DetailBox label="Loại xe đăng ký" value={booking.vehicleTypeName} />
            <DetailBox label="Khu vực" value={booking.areaName} />
            <DetailBox label="Slot giữ chỗ" value={booking.internalSlotCode} mono />
            <DetailBox label="Phí đã thanh toán" value={formatMoney(booking.reservationFee)} />
            <DetailBox label="Thanh toán lúc" value={formatDateTime(booking.paidAt || booking.createdAt)} />
            <DetailBox label="Hạn check-in" value={formatDateTime(windowInfo?.checkInExpiry)} />
            <DetailBox label="Gia hạn đến" value={formatDateTime(windowInfo?.graceExpiry)} />
            <div className="rounded-xl border bg-muted/35 p-3 sm:col-span-2">
              <p className="text-xs font-black uppercase text-muted-foreground">Đánh giá</p>
              <p className="mt-1 text-sm font-semibold">{windowInfo?.message || "--"}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-muted/35 p-4 text-sm font-semibold text-muted-foreground">
            Chưa có booking để hiển thị.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ImagePreviewDialog({ preview, onOpenChange }) {
  return (
    <Dialog open={Boolean(preview)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{preview?.title || "Ảnh thiết bị"}</DialogTitle>
          <DialogDescription>Ảnh do thiết bị cổng gửi lên để Staff đối chiếu.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[72dvh] items-center justify-center overflow-hidden rounded-xl border bg-muted/35">
          {preview?.image ? (
            <img src={preview.image} alt={preview.title} className="max-h-[72dvh] w-full object-contain" />
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-muted-foreground">
              <ImageIcon className="size-12" />
              <p className="text-sm font-bold">Chưa có ảnh từ thiết bị</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function DetailBox({ label, value, mono }) {
  return (
    <div className="min-w-0 rounded-xl border bg-muted/35 p-3">
      <p className="text-xs font-black uppercase text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-bold", mono && "font-mono font-black")}>{value || "--"}</p>
    </div>
  );
}
