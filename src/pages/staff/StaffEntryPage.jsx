import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
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
  AlertTriangle,
  Plus,
  MapPin,
  Check,
  X,
  CreditCard as CardIcon,
  Search,
  Bell,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { bookingService } from "../../services/bookingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    second: "2-digit",
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

export default function StaffEntryPage() {
  const { currentUser } = useOutletContext() || {};
  const staffName = currentUser?.fullName || currentUser?.username || "Nhân viên Trực";

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
  
  const [currentTime, setCurrentTime] = useState(formatDateTime(new Date()));

  const processedEventRef = useRef("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleConfirmEntry = async () => {
    if (!deviceDraft.cardCode.trim()) {
      toast.error("Vui lòng quét hoặc nhập mã thẻ NFC trước khi xác nhận.");
      return;
    }
    if (!deviceDraft.plate.trim()) {
      toast.error("Vui lòng nhập biển số xe thực tế.");
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
        setSuccessMsg(`Đã tạo phiên ${session?.sessionCode || ""} cho xe vãng lai. Biển: ${deviceDraft.plate}, Thẻ: ${deviceDraft.cardCode}`);
      } else {
        setSuccessMsg(`Đã gán thẻ ${deviceDraft.cardCode} và xác nhận xe vào bãi cho booking ${selectedBooking.id}.`);
      }
      
      toast.success(successMsg || "Tạo phiên thành công!");
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

  // Derived UI states
  const isCardValid = !!deviceDraft.cardCode.trim();
  const isPlateValid = deviceDraft.plate.trim().length >= 5;
  const isVehicleTypeValid = !!deviceDraft.vehicleTypeName;
  const allChecksPassed = isCardValid && isPlateValid && isVehicleTypeValid;
  const hasBooking = !!selectedBooking;

  return (
    <div className="h-[calc(100dvh-11rem)] md:h-[calc(100dvh-7rem)] flex flex-col bg-transparent text-slate-800 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center rounded-lg shadow-sm text-white font-black text-xl">
            P
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase">SWP BUILDING</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">SMART PARKING</p>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block"></div>
          <div className="hidden lg:flex items-center gap-2 text-slate-600 bg-white px-3 py-1.5 rounded border shadow-sm">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-bold">Entry Processing</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-slate-500 hover:text-slate-800 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border shadow-sm cursor-pointer hover:bg-slate-50 transition">
            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{staffName}</p>
              <p className="text-[10px] text-slate-500">Nhân viên</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </header>

      {successMsg && (
        <div className="mb-4 flex shrink-0 items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-in fade-in zoom-in">
          <CheckCircle2 className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* MAIN CONSOLE GRID */}
      <main className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6 pb-2">
        
        {/* ================= COLUMN 1: CAMERA (Span 4) ================= */}
        <section className="xl:col-span-4 flex flex-col gap-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-0">
          <div className="p-3 border-b flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">1</span>
              <h3 className="font-bold text-slate-800 text-sm">Camera nhận diện</h3>
            </div>
            <div className="flex gap-1.5">
              <Badge variant="outline" className={`text-[9px] ${deviceDraft.plate ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-400'}`}>Biển số đã nhận diện</Badge>
              <Badge variant="outline" className={`text-[9px] ${isCardValid ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-400'}`}>Thẻ hợp lệ</Badge>
            </div>
          </div>

          <div className="relative flex-1 bg-slate-900 w-full flex items-center justify-center overflow-hidden min-h-0">
            {deviceDraft.vehicleImageDataUrl ? (
              <img src={deviceDraft.vehicleImageDataUrl} alt="Camera feed" className="w-full h-full object-cover opacity-90" />
            ) : (
              <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" alt="Camera feed mockup" className="w-full h-full object-cover opacity-90" />
            )}

            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="font-mono text-[10px] text-white font-bold tracking-wider">LIVE</span>
            </div>

            {deviceDraft.plate && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 border-2 border-emerald-400 bg-black/50 px-4 py-1.5 rounded shadow-lg backdrop-blur-sm">
                <p className="text-white text-lg font-black font-mono tracking-widest">{deviceDraft.plate}</p>
              </div>
            )}

            <div className="absolute bottom-3 left-3 text-white font-mono text-[10px] font-bold opacity-70">
              CAM_ENTRY_01
            </div>
            <div className="absolute bottom-3 right-10 text-white font-mono text-[10px] font-bold opacity-70">
              {currentTime}
            </div>
            <button 
              onClick={() => setPreviewImage({ title: "Camera Feed", image: deviceDraft.vehicleImageDataUrl })}
              className="absolute bottom-3 right-3 bg-black/50 p-1.5 rounded text-white hover:bg-black/80 transition"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </section>

        {/* ================= COLUMN 2: FORM INFO (Span 4) ================= */}
        <section className="xl:col-span-4 flex flex-col gap-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-0">
          <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">2</span>
            <h3 className="font-bold text-slate-800 text-sm">Thông tin xe vào</h3>
          </div>

          <div className="p-4 flex flex-col gap-4 text-sm font-medium overflow-y-auto flex-1 min-h-0">
            <div className="flex items-center gap-4">
              <label className="w-24 text-slate-500">Biển số <span className="text-red-500">*</span></label>
              <div className="relative flex-1">
                <Input value={deviceDraft.plate} onChange={(e) => setDeviceDraft(c => ({...c, plate: e.target.value.toUpperCase()}))} className="font-bold border-slate-200 shadow-none h-9" />
                {isPlateValid && <span className="absolute right-2 top-2 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Đã nhận diện</span>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-slate-500">Mã thẻ</label>
              <div className="relative flex-1">
                <Input value={deviceDraft.cardCode} onChange={(e) => setDeviceDraft(c => ({...c, cardCode: e.target.value.toUpperCase()}))} className="font-bold border-slate-200 shadow-none h-9" />
                {isCardValid && <span className="absolute right-2 top-2 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Hợp lệ</span>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-slate-500">Loại xe <span className="text-red-500">*</span></label>
              <div className="flex-1 flex gap-2">
                {["Xe máy", "Ô tô", "Xe tải"].map(type => (
                  <button 
                    key={type}
                    onClick={() => setDeviceDraft(c => ({...c, vehicleTypeName: type}))}
                    className={`flex-1 py-1.5 border rounded flex justify-center items-center gap-1.5 text-xs transition ${deviceDraft.vehicleTypeName.toLowerCase() === type.toLowerCase() ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-slate-500">Nhóm tài xế <span className="text-red-500">*</span></label>
              <div className="flex-1 flex gap-2">
                <div className="flex-1 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded flex justify-center items-center text-xs font-bold">
                  Hệ thống tự động nhận diện (API F025)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-slate-500">Khách hàng</label>
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Input value={selectedBooking?.username || ""} readOnly placeholder="Chọn từ danh sách" className="pl-8 border-slate-200 shadow-none h-9 text-xs" />
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                </div>
                <Button variant="ghost" className="h-9 px-3 text-blue-600 text-xs hover:bg-blue-50 font-semibold flex gap-1">
                  <Plus className="w-3 h-3" /> Thêm mới
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-slate-500">Cổng vào <span className="text-red-500">*</span></label>
              <Select value={deviceDraft.gateCode} onValueChange={(val) => setDeviceDraft(c => ({...c, gateCode: val}))}>
                <SelectTrigger className="flex-1 h-9 border-slate-200 shadow-none text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GATE-IN-01">Cổng A1</SelectItem>
                  <SelectItem value="GATE-IN-02">Cổng A2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 text-slate-500">Thời gian vào <span className="text-red-500">*</span></label>
              <div className="flex-1 flex gap-2 items-center">
                <div className="flex-1 border border-slate-200 rounded px-3 py-1.5 flex items-center gap-2 bg-slate-50">
                  <Clock3 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono font-bold text-slate-700">{currentTime}</span>
                </div>
                <button className="text-xs font-semibold text-blue-600 hover:underline">Lấy giờ hiện tại</button>
              </div>
            </div>

            {/* Snapshots */}
            <div className="grid grid-cols-2 gap-3 mt-2 border-t pt-4 border-slate-100">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 text-center">Ảnh xe</span>
                <div className="aspect-[2/1] rounded overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {deviceDraft.vehicleImageDataUrl ? (
                    <img src={deviceDraft.vehicleImageDataUrl} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage({ title: "Ảnh xe", image: deviceDraft.vehicleImageDataUrl })}/>
                  ) : <ImageIcon className="w-5 h-5 text-slate-300" />}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 text-center">Ảnh biển số</span>
                <div className="aspect-[2/1] rounded overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {deviceDraft.plateImageDataUrl ? (
                    <img src={deviceDraft.plateImageDataUrl} className="w-full h-full object-contain cursor-pointer" onClick={() => setPreviewImage({ title: "Ảnh biển", image: deviceDraft.plateImageDataUrl })}/>
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                       <span className="text-white font-mono font-black text-xl">{deviceDraft.plate || '---'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COLUMN 3: BOOKING (Span 4) ================= */}
        <section className="xl:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4 h-full overflow-y-auto min-h-0">
            <h3 className="font-bold text-slate-800 text-sm mb-1 shrink-0">Xác minh xe vào</h3>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={clearBooking}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition ${!hasBooking ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Không Booking
              </button>
              <button 
                className={`flex-1 py-2 text-xs font-bold rounded-md transition ${hasBooking ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Có Booking
              </button>
            </div>

            {hasBooking ? (
               <div className="flex flex-col items-center justify-center py-6 gap-2 text-center flex-1">
                 <QrCode className="w-12 h-12 text-indigo-600 mb-2" />
                 <h4 className="font-black text-slate-800 uppercase">Khách Đặt Trước</h4>
                 <p className="text-xs text-slate-500">Đã tìm thấy booking {selectedBooking.id}</p>
                 <Select value={selectedBookingId || undefined} onValueChange={handleBookingChange}>
                    <SelectTrigger className="w-full mt-4 h-9 font-bold text-xs border-slate-300">
                      <SelectValue placeholder="Chọn booking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {paidBookings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.id} - {b.plate}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 gap-2 text-center flex-1">
                <CarFront className="w-12 h-12 text-slate-700 mb-2 opacity-80" />
                <h4 className="font-black text-slate-800 uppercase tracking-wide">Khách vãng lai</h4>
                <p className="text-xs text-slate-500 max-w-[200px]">Xe vào không có booking. Vui lòng kiểm tra thông tin và tạo phiên đỗ xe.</p>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-auto border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs p-2 border border-slate-100 rounded bg-slate-50">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5"><CarFront className="w-3.5 h-3.5"/> Tổng số chỗ trống</span>
                <span className="font-black text-blue-600">58 / 138</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 border border-slate-100 rounded bg-slate-50">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5"/> Tỷ lệ sử dụng</span>
                <span className="font-black text-emerald-600">42%</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 border border-slate-100 rounded bg-slate-50">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Chỗ trống gần nhất</span>
                <span className="font-bold text-purple-700">B2 - A12 (25m)</span>
              </div>
            </div>

            <div className={`mt-2 p-3 rounded-lg border flex gap-3 ${isCardValid ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCardValid ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-900'}`}>
                {isCardValid ? <Check className="w-4 h-4 font-bold" /> : <CardIcon className="w-4 h-4" />}
              </div>
              <div className="flex flex-col justify-center">
                <span className={`text-xs font-bold ${isCardValid ? 'text-emerald-800' : 'text-amber-800'}`}>{isCardValid ? 'Đã nhận thẻ' : 'Chờ quét thẻ...'}</span>
                <span className={`text-[10px] ${isCardValid ? 'text-emerald-600' : 'text-amber-700'}`}>{isCardValid ? `Mã thẻ: ${deviceDraft.cardCode}` : 'Đưa thẻ vào đầu đọc để kiểm tra.'}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-blue-600 text-center font-semibold bg-blue-50 py-1.5 rounded-full mt-1">
              ⓘ Quét thẻ để tiếp tục quy trình xe vào
            </p>
          </div>
        </section>

        {/* ================= BOTTOM LEFT: CHECKLIST (Span 4) ================= */}
        <section className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">3</span>
            <h3 className="font-bold text-slate-800 text-sm">Kiểm tra hệ thống</h3>
          </div>
          <div className="p-4 flex flex-col gap-0 flex-1 overflow-y-auto min-h-0">
            <CheckRow label="Thẻ hợp lệ" isPass={isCardValid} falseLabel="Thẻ không hợp lệ" actionText="Kiểm tra thẻ" />
            <CheckRow label="Không có phiên đang mở" isPass={true} actionText="OK" />
            <CheckRow label="Loại xe hợp lệ" isPass={isVehicleTypeValid} actionText={deviceDraft.vehicleTypeName} />
            <CheckRow label="Đủ biển nhận diện" isPass={isPlateValid} falseLabel="Thiếu biển nhận diện" actionText="OK" />
            <CheckRow label="Barrier & cổng vào" isPass={true} actionText="OK" />
            
            <div className={`mt-auto p-3 rounded border flex gap-3 ${allChecksPassed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
              {allChecksPassed ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
              <span className="text-xs font-bold leading-5">
                {allChecksPassed ? "Tất cả điều kiện hợp lệ. Có thể tạo phiên đỗ xe." : "Vui lòng hoàn thiện các điều kiện để tiếp tục."}
              </span>
            </div>
          </div>
        </section>

        {/* ================= BOTTOM MIDDLE: SUGGESTION MAP (Span 4) ================= */}
        <section className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-3 border-b flex items-center justify-between bg-white shrink-0">
             <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">4</span>
                <h3 className="font-bold text-slate-800 text-sm">Gợi ý vị trí đỗ</h3>
             </div>
             <span className="text-[9px] text-slate-400">ⓘ Dựa trên loại xe và khoảng cách.</span>
          </div>
          
          <div className="flex flex-1 p-3 gap-3 overflow-hidden min-h-0">
             {/* List */}
             <div className="flex flex-col gap-2 w-1/3 min-w-[120px] overflow-y-auto pr-1">
                <div className="border border-indigo-200 bg-indigo-50 rounded p-2 shadow-sm">
                   <p className="text-[10px] font-bold text-indigo-800 uppercase mb-1">Ô TÔ TIỆN TÀI</p>
                   <div className="flex justify-between items-center text-xs font-bold text-slate-700"><span>B2 - A12</span><span className="text-emerald-600">25m</span></div>
                   <div className="flex justify-between items-center text-xs text-slate-600 mt-1"><span>B2 - A15</span><span className="text-emerald-600 font-semibold">32m</span></div>
                   <div className="flex justify-between items-center text-xs text-slate-600 mt-1"><span>B2 - A16</span><span className="text-emerald-600 font-semibold">35m</span></div>
                </div>
                <div className="border border-slate-100 rounded p-2 hover:bg-slate-50 transition cursor-pointer">
                   <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ô TÔ THƯỜNG</p>
                   <div className="flex justify-between items-center text-xs text-slate-600"><span>B2 - B23</span><span className="text-emerald-600 font-semibold">45m</span></div>
                </div>
                <div className="border border-slate-100 rounded p-2 hover:bg-slate-50 transition cursor-pointer">
                   <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">XE MÁY</p>
                   <div className="flex justify-between items-center text-xs text-slate-600"><span>B1 - M15</span><span className="text-emerald-600 font-semibold">28m</span></div>
                </div>
             </div>
             
             {/* Map Mockup */}
             <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-2 relative flex flex-col">
                <p className="text-[10px] font-bold text-slate-800 mb-2">Tầng B2 - Khu A</p>
                <div className="flex-1 flex flex-col justify-center gap-2 items-center">
                   {/* Top Row Slots */}
                   <div className="flex gap-1">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={`t${i}`} className={`w-6 h-10 rounded-sm border ${i===3 ? 'bg-slate-200 border-slate-300' : 'bg-emerald-100 border-emerald-200'}`}></div>
                      ))}
                   </div>
                   {/* Path */}
                   <div className="w-full h-4 relative flex items-center px-4">
                      <div className="w-full h-px border-t-2 border-dashed border-indigo-400"></div>
                      <CarFront className="w-4 h-4 text-indigo-600 absolute left-4 -top-2 bg-slate-50 px-0.5" />
                      <div className="w-4 h-4 bg-blue-600 text-white rounded text-[8px] flex items-center justify-center absolute right-10 -top-2 font-bold shadow-sm">P</div>
                   </div>
                   {/* Bottom Row Slots */}
                   <div className="flex gap-1">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={`b${i}`} className={`w-6 h-10 rounded-sm border ${i===5 ? 'bg-blue-500 border-blue-600' : 'bg-emerald-100 border-emerald-200'}`}></div>
                      ))}
                   </div>
                </div>
                <div className="flex justify-center gap-4 mt-2 text-[8px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Trống</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Đã chiếm</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Đang chọn</span>
                </div>
             </div>
          </div>
        </section>

        {/* ================= BOTTOM RIGHT: ACTIONS (Span 4) ================= */}
        <section className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">5</span>
            <h3 className="font-bold text-slate-800 text-sm">Thao tác</h3>
          </div>
          <div className="p-5 flex-1 grid grid-cols-2 gap-3 content-start overflow-y-auto min-h-0">
             <Button 
               onClick={handleConfirmEntry} 
               disabled={!allChecksPassed || isConfirming}
               className="h-14 font-bold shadow-sm bg-blue-600 hover:bg-blue-700 text-white text-sm"
             >
               {isConfirming ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <div className="w-5 h-5 mr-2 rounded bg-white/20 flex items-center justify-center text-[10px]">P</div>}
               Tạo phiên đỗ xe
             </Button>

             <Button variant="outline" className="h-14 font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
               <CardIcon className="w-5 h-5 mr-2 text-indigo-600" />
               Quét thẻ
             </Button>

             <Button variant="outline" className="h-14 font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
               <Camera className="w-5 h-5 mr-2 text-emerald-600" />
               Quét biển số
             </Button>

             <Button variant="outline" className="h-14 font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
               <RefreshCw className="w-5 h-5 mr-2 text-amber-500" />
               Kiểm tra lại
             </Button>

             <Button variant="ghost" className="col-span-2 h-14 font-bold text-rose-600 hover:bg-rose-50 mt-2">
               <XCircle className="w-5 h-5 mr-2" />
               Hủy giao dịch
             </Button>
          </div>
        </section>

      </main>
      
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
        ⓘ Thời gian xử lý mục tiêu: 3 - 5 giây / lượt xe vào
      </div>

      <ImagePreviewDialog preview={previewImage} onOpenChange={(open) => !open && setPreviewImage(null)} />
    </div>
  );
}

// Sub components
function CheckRow({ label, isPass, falseLabel, actionText }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 border-dashed">
      <div className="flex items-center gap-3">
        {isPass ? (
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-rose-600" />
          </div>
        )}
        <span className={`text-sm font-semibold ${isPass ? 'text-slate-800' : 'text-slate-500 line-through opacity-70'}`}>
          {isPass ? label : (falseLabel || label)}
        </span>
      </div>
      <span className={`text-xs font-bold ${isPass ? 'text-emerald-600' : 'text-rose-500'}`}>
        {actionText} {isPass ? <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" /> : <XCircle className="w-3.5 h-3.5 inline ml-1" />}
      </span>
    </div>
  );
}

function ImagePreviewDialog({ preview, onOpenChange }) {
  return (
    <Dialog open={Boolean(preview)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>{preview?.title || "Ảnh thiết bị"}</DialogTitle>
          <DialogDescription>Ảnh do thiết bị cổng gửi lên để Staff đối chiếu.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[72dvh] items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
          {preview?.image ? (
            <img src={preview.image} alt={preview.title} className="max-h-[72dvh] w-full object-contain" />
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-slate-400">
              <ImageIcon className="size-12" />
              <p className="text-sm font-bold">Chưa có ảnh từ thiết bị</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
