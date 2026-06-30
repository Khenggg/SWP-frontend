import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Camera,
  CreditCard,
  ReceiptText,
  RadioTower,
  Search,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Info,
  Clock3,
  Bell,
  ChevronDown,
  CarFront,
  Image as ImageIcon,
  Check,
  XCircle
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function normalizePlate(value) {
  return String(value || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function ImagePreviewDialog({ preview, onOpenChange }) {
  if (!preview) return null;
  return (
    <Dialog open={!!preview} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border-none p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-black/50 absolute top-0 w-full z-10">
          <DialogTitle className="text-white">{preview.title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-video flex items-center justify-center bg-black pt-14 pb-4 px-4">
          <img src={preview.image} alt={preview.title} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffExitPage() {
  const { currentUser } = useOutletContext() || {};
  const staffName = currentUser?.fullName || currentUser?.username || "Nhân viên Trực";

  const [cardCode, setCardCode] = useState("");
  const [plate, setPlate] = useState("");
  const [session, setSession] = useState(null);
  const [fee, setFee] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceEvent, setDeviceEvent] = useState(null);
  const [mismatchCase, setMismatchCase] = useState(null);
  const [isCreatingMismatch, setIsCreatingMismatch] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentTime, setCurrentTime] = useState(formatDateTime(new Date()));

  const processedEventRef = useRef("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
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

  useEffect(() => {
    if (!session || !mismatchCase || mismatchCase.status !== "PENDING") return;
    const interval = setInterval(async () => {
      try {
        const mismatches = await approvalService.getMismatchCases();
        const matched = mismatches.find((m) => m.id === mismatchCase.id);
        if (matched && matched.status !== mismatchCase.status) {
          setMismatchCase(matched);
          toast.info(`Hồ sơ sự cố ${matched.caseCode} đã được cập nhật: ${matched.status}`);
        }
      } catch (err) {
        console.error("Lỗi cập nhật trạng thái hồ sơ:", err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [session, mismatchCase]);

  const hasMismatch = useMemo(() => {
    if (!session) return false;
    return normalizePlate(session.plateNumber) !== normalizePlate(plate);
  }, [plate, session]);

  const paymentReady = useMemo(() => {
    return fee && (!fee.paymentRequired || fee.paymentStatus === "PAID" || session?.paymentStatus === "PAID");
  }, [fee, session]);

  const canExit = useMemo(() => {
    if (!paymentReady) return false;
    return !hasMismatch || mismatchCase?.status === "APPROVED";
  }, [paymentReady, hasMismatch, mismatchCase]);

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
    if (!session || !plate) return;
    setIsCreatingMismatch(true);
    try {
      const createdCase = await staffSessionService.createMismatchCase({
        sessionId: session.id,
        exitPlateNumber: plate,
        reason: `Biển ra ${plate} khác biển số vào ${session.plateNumber}.`,
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
      setCardCode("");
      setPlate("");
      toast.success("Đã hoàn tất lượt xe ra và giải phóng slot đỗ.");
    } catch (error) {
      toast.error(error.message || "Không thể xác nhận hoàn tất lượt xe ra.");
    }
  };

  const changeAmount = useMemo(() => {
    if (!fee || fee.paymentStatus === "PAID") return 0;
    const received = Number(receivedAmount) || 0;
    return Math.max(0, received - fee.totalAmount);
  }, [fee, receivedAmount]);

  return (
    <div className="h-[calc(100dvh-11rem)] md:h-[calc(100dvh-7rem)] flex flex-col bg-transparent text-slate-800 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* HEADER */}
      <header className="flex-none flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center rounded-lg shadow-sm text-white font-black text-xl">
            E
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Xử lý ra xe
              {deviceEvent && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {deviceEvent.gateCode}
                </span>
              )}
            </h1>
            <p className="text-sm font-medium text-slate-500">Quét thẻ QR / nhập biển số / tìm phiên để xử lý ra xe</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="hidden md:flex items-center gap-3 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">1</span> Tìm phiên
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className={`flex items-center gap-1.5 ${session ? 'text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center ${session ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span> Xác nhận thông tin
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className={`flex items-center gap-1.5 ${fee ? 'text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center ${fee ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span> Tính phí
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className={`flex items-center gap-1.5 ${paymentReady ? 'text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentReady ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>4</span> Thanh toán
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">5</span> Hoàn tất
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="flex-1 min-h-0 flex flex-col gap-4 lg:gap-6 pb-2">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 min-h-0 flex-1">
          
          {/* COLUMN 1: Search & Confirmation */}
          <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
            {/* 1. Search */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">1</span>
                <h3 className="font-bold text-slate-800 text-sm">Tìm phiên đang hoạt động</h3>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                  <button className="flex-1 py-1.5 text-xs font-bold rounded-md bg-white text-indigo-600 shadow-sm flex items-center justify-center gap-1.5">
                    <QrCode className="w-4 h-4" /> Quét QR thẻ
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5">
                    <CarFront className="w-4 h-4" /> Biển số xe
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5">
                    <Search className="w-4 h-4" /> Tìm kiếm phiên
                  </button>
                </div>
                
                <div className="flex-1 flex gap-4 min-h-0">
                  <div className="flex-1 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl flex flex-col items-center justify-center text-center p-4">
                    <QrCode className="w-12 h-12 text-indigo-400 mb-2" />
                    <p className="font-bold text-sm text-indigo-900">Quét mã QR thẻ xe</p>
                    <p className="text-[10px] text-indigo-600 font-medium">Đưa mã vào khung để quét</p>
                  </div>
                  <div className="flex-[1.5] flex flex-col justify-center gap-2">
                    <label className="text-xs font-bold text-slate-700">Hoặc nhập mã thẻ / biển số</label>
                    <div className="relative">
                      <Input 
                        value={plate || cardCode}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          if (val.startsWith("CARD") || val.startsWith("TH-")) {
                            setCardCode(val);
                            setPlate("");
                          } else {
                            setPlate(val);
                            setCardCode("");
                          }
                        }}
                        placeholder="Nhập mã thẻ hoặc biển số"
                        className="pr-10 border-slate-200"
                      />
                      <Button size="icon" variant="ghost" onClick={() => runSearch()} className="absolute right-1 top-1 h-7 w-7 text-indigo-600 hover:bg-indigo-50">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Gợi ý: 30F12345, TH-001122</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Confirmation */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">4</span>
                <h3 className="font-bold text-slate-800 text-sm">Xác nhận thông tin ra xe</h3>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Biển số thực tế (nếu khác)</label>
                    <div className="relative">
                      <Input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} className="font-bold uppercase pr-8" placeholder="Nhập biển số thực tế" />
                      <Camera className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Ghi chú (nếu có)</label>
                    <Input placeholder="Nhập ghi chú" className="text-sm" />
                  </div>
                </div>
                
                {hasMismatch && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-amber-900">Cảnh báo sai lệch biển số!</p>
                        <p className="text-[10px] text-amber-700">Biển số lúc ra ({plate}) khác với lúc vào ({session?.plateNumber}).</p>
                      </div>
                    </div>
                    {mismatchCase ? (
                      <Badge variant="outline" className="w-fit bg-white border-amber-300 text-amber-800 text-[10px]">
                        Trạng thái xử lý: {mismatchCase.status}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={handleCreateMismatchCase} disabled={isCreatingMismatch} className="w-fit h-7 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border-none shadow-none">
                        Tạo yêu cầu xử lý
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded border border-indigo-600 bg-indigo-600 flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                    <span className="text-xs font-bold text-slate-700">Xác nhận xe đã rời bãi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer opacity-50">
                    <div className="w-4 h-4 rounded border border-slate-300 bg-white"></div>
                    <span className="text-xs font-bold text-slate-600">Không in hóa đơn</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nhân viên xử lý</label>
                    <div className="bg-slate-50 border rounded px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-indigo-600" /></div>
                      Nhân viên Trực
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Thời gian ra (hiện tại)</label>
                    <div className="bg-slate-50 border rounded px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                      {currentTime}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* COLUMN 2: Session Info & Images */}
          <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
            {/* 2. Session Info */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="p-3 border-b flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">2</span>
                  <h3 className="font-bold text-slate-800 text-sm">Thông tin phiên</h3>
                </div>
                {session && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Đang hoạt động</Badge>}
              </div>
              
              <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
                {session ? (
                  <>
                    <div className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-lg border shadow-sm flex flex-col items-center justify-center shrink-0">
                        <CarFront className="w-5 h-5 text-slate-600" />
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">{session.vehicleTypeName}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biển số</span>
                        <span className="text-lg font-black text-slate-900">{session.plateNumber}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-end text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian vào</span>
                        <span className="text-sm font-bold text-slate-800">{formatDateTime(session.entryTime)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                      <div>
                        <span className="text-slate-500 mb-1 block">Mã thẻ</span>
                        <span className="font-bold font-mono">{session.cardCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 mb-1 block">Cổng vào</span>
                        <span className="font-bold">{session.entryGateCode || "GATE-IN-01"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 mb-1 block">Loại khách</span>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">{session.customerType === 'MONTHLY' ? 'Thẻ tháng' : 'Vãng lai'}</Badge>
                      </div>
                      <div>
                        <span className="text-slate-500 mb-1 block">Vị trí đỗ</span>
                        <span className="font-bold">{session.floorCode} - {session.areaCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 mb-1 block">Tên khách</span>
                        <span className="font-bold">{session.customerType === 'MONTHLY' ? 'Khách hàng A' : 'Khách vãng lai'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 mb-1 block">Trạng thái phí</span>
                        <Badge variant="outline" className={`text-[10px] ${session.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {session.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400 italic">
                    Chưa chọn phiên đỗ xe
                  </div>
                )}
                
                <div className="mt-auto bg-amber-50 border border-amber-200 rounded-md p-2 flex items-start gap-2 text-amber-800 text-xs font-medium">
                  <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <p>Vui lòng kiểm tra kỹ thông tin trước khi tính phí.</p>
                </div>
              </div>
            </section>

            {/* 5. Camera/Images */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">5</span>
                <h3 className="font-bold text-slate-800 text-sm">Hình ảnh đối chiếu</h3>
              </div>
              <div className="p-4 flex flex-col gap-3 overflow-y-auto min-h-0 flex-1">
                <p className="text-xs font-bold text-slate-500 mb-1">Ảnh xe lúc vào (Lưu trữ)</p>
                {session?.entryVehicleImageDataUrl ? (
                  <div className="w-full h-32 bg-slate-100 rounded-lg border overflow-hidden shrink-0">
                    <img src={session.entryVehicleImageDataUrl} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage({ title: "Ảnh xe vào", image: session.entryVehicleImageDataUrl })}/>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Không có ảnh vào</span>
                  </div>
                )}

                <p className="text-xs font-bold text-slate-500 mb-1 mt-2">Ảnh biển số lúc ra (Hiện tại)</p>
                {deviceEvent?.plateImageDataUrl ? (
                  <div className="w-full flex-1 bg-slate-100 rounded-lg border overflow-hidden min-h-[80px]">
                    <img src={deviceEvent.plateImageDataUrl} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage({ title: "Ảnh biển số ra", image: deviceEvent.plateImageDataUrl })}/>
                  </div>
                ) : (
                  <div className="w-full flex-1 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2 min-h-[80px]">
                    <Camera className="w-6 h-6 text-slate-300" />
                    <span className="text-[10px] font-bold">Chờ camera cổng ra...</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* COLUMN 3: Fee & Payment */}
          <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
            {/* 3. Fee Summary */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">3</span>
                <h3 className="font-bold text-slate-800 text-sm">Tóm tắt phí</h3>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
                {fee ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Phí giữ xe</span>
                        <span className="font-bold">{formatVND(fee.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Giảm giá</span>
                        <span className="font-bold">- 0 đ</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Phụ phí</span>
                        <span className="font-bold">0 đ</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-black text-slate-800">Tổng tiền</span>
                        <span className="text-2xl font-black text-indigo-600">{formatVND(fee.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="mt-4 bg-slate-50 border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-500"><Clock3 className="w-3.5 h-3.5" /> Thời gian đỗ</span>
                        <span className="font-bold">{fee.durationHours} giờ</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 ml-5">Đơn giá áp dụng</span>
                        <span className="font-bold">20.000 đ / giờ</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400 italic">
                    Chờ tính phí...
                  </div>
                )}
              </div>
            </section>

            {/* 6. Payment */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">6</span>
                <h3 className="font-bold text-slate-800 text-sm">Thanh toán</h3>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                  <button className="flex-1 py-1.5 text-xs font-bold rounded-md bg-white shadow-sm text-emerald-600 border border-emerald-200">Tiền mặt</button>
                  <button className="flex-1 py-1.5 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700">Miễn phí</button>
                </div>
                
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Khách trả</label>
                    <div className="relative">
                      <Input value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} className="font-bold text-right pr-8 h-10" />
                      <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-sm">đ</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <span className="text-xs font-bold text-emerald-800">Tiền thừa</span>
                    <span className="text-sm font-black text-emerald-600">{formatVND(changeAmount)}</span>
                  </div>
                </div>

                <div className="mt-auto space-y-2 shrink-0">
                  <Button 
                    onClick={session?.paymentStatus === 'PAID' ? handleCompleteExit : handlePayCash} 
                    disabled={!canExit && session?.paymentStatus !== 'PAID'} 
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
                    {session?.paymentStatus === 'PAID' ? 'Hoàn tất & Xe ra' : 'Xác nhận thanh toán'}
                  </Button>
                  <Button variant="outline" className="w-full h-10 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Hủy giao dịch
                  </Button>
                </div>
              </div>
            </section>
          </div>
          
        </div>

        </main>

      <ImagePreviewDialog preview={previewImage} onOpenChange={(open) => !open && setPreviewImage(null)} />
    </div>
  );
}
