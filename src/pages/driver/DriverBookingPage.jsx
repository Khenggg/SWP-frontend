import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, CreditCard, CheckCircle2, AlertTriangle, 
  Trash2, Play, RefreshCw, Layers, ShieldCheck, ShieldAlert, Users 
} from "lucide-react";
import { vehicleService } from "../../services/vehicleService";
import { parkingService } from "../../services/parkingService";
import { bookingService } from "../../services/bookingService";
import { pricingService } from "../../services/pricingService";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BOOKING_STATUS } from "@/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LicensePlate from "@/components/ui/license-plate";

// Helper functions for date/time manipulation
const addMinutes = (dateStr, mins) => {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
};

const addHours = (dateStr, hrs) => {
  const d = new Date(dateStr);
  d.setHours(d.getHours() + hrs);
  return d.toISOString();
};

const getMinutesDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2.getTime() - d1.getTime()) / 60000);
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function DriverBookingPage() {
  const [driver, setDriver] = useState(() => {
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          username: parsed.username || "",
          fullName: parsed.fullName || "",
          phone: parsed.phone || "",
        };
      } catch (e) {
        console.error("Lỗi đọc user", e);
      }
    }
    return {
      username: "",
      fullName: "",
      phone: "",
    };
  });

  // Simulated Time
  const [simTime, setSimTime] = useState("");
  // Current Active Booking
  const [activeBooking, setActiveBooking] = useState(null);
  // Driver's eligible vehicles
  const [myVehicles, setMyVehicles] = useState([]);
  
  // States for async data loading
  const [areas, setAreas] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  // Form State: Areas
  const [selectedAreaCode, setSelectedAreaCode] = useState("B2-A");
  const [durationHours, setDurationHours] = useState(3);
  
  // Selection state for check-in
  const [checkInPlate, setCheckInPlate] = useState("");
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isManualPlate, setIsManualPlate] = useState(false);

  // Initializing page
  useEffect(() => {
    const initPage = async () => {
      // 1. Get logged in driver details
      const savedUser = sessionStorage.getItem("currentUser");
      let driverName = "";
      let driverPhone = "";
      let driverUsername = "";
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          driverName = parsed.fullName || "";
          driverPhone = parsed.phone || "";
          driverUsername = parsed.username || "";
          setDriver({ username: driverUsername, fullName: driverName, phone: driverPhone });
        } catch (e) {
          console.error("Lỗi đọc user", e);
        }
      }

      // 3. Load simulated time (default to current actual time if not present)
      const savedSimTime = localStorage.getItem("driver_sim_time");
      if (savedSimTime) {
        setSimTime(savedSimTime);
      } else {
        const now = new Date().toISOString();
        setSimTime(now);
        localStorage.setItem("driver_sim_time", now);
      }

      try {
        // 2. Load driver's vehicles
        const vehicles = await vehicleService.getVehiclesByOwner();
        setMyVehicles(vehicles);

        // 4. Load active booking using bookingService
        const savedBooking = await bookingService.getActiveBooking();
        if (savedBooking) {
          setActiveBooking(savedBooking);
        }

        // 5. Load areas
        const areasData = await parkingService.getAreas();
        setAreas(areasData);

        // 6. Load pricing rules
        const rulesData = await pricingService.getPricingRules();
        setPricingRules(rulesData);
      } catch (e) {
        console.error("Lỗi khởi tạo dữ liệu bãi xe:", e);
      }
    };

    initPage();
  }, []);

  // Time simulation engine runs whenever simulated time changes
  useEffect(() => {
    if (!simTime || !activeBooking) return;

    let updated = false;
    let newStatus = activeBooking.status;

    if (activeBooking.status === BOOKING_STATUS.PENDING) {
      const diff = getMinutesDiff(activeBooking.createdAt, simTime);
      if (diff > 15) {
        newStatus = BOOKING_STATUS.EXPIRED_TIMEOUT;
        updated = true;
      }
    } else if (activeBooking.status === BOOKING_STATUS.PAID) {
      const paidAtTime = activeBooking.paidAt;
      const durationMins = activeBooking.hours * 60;
      const diff = getMinutesDiff(paidAtTime, simTime);
      
      // Total check-in window is duration + 15 minutes grace period
      if (diff > durationMins + 15) {
        newStatus = BOOKING_STATUS.EXPIRED_CHECKIN;
        updated = true;
      }
    }

    if (updated) {
      const expire = async () => {
        try {
          await bookingService.expireBooking(newStatus);
          setActiveBooking(null);
        } catch (e) {
          console.error("Lỗi cập nhật hết hạn booking:", e);
        }
      };
      expire();
    }
  }, [simTime, activeBooking]);

  // Adjust time
  const handleAdjustTime = (amountMinutes) => {
    const current = new Date(simTime);
    current.setMinutes(current.getMinutes() + amountMinutes);
    const newTime = current.toISOString();
    setSimTime(newTime);
    localStorage.setItem("driver_sim_time", newTime);
  };

  const handleResetTime = () => {
    const now = new Date().toISOString();
    setSimTime(now);
    localStorage.setItem("driver_sim_time", now);
  };

  // Get pricing dynamically
  const getHourlyPrice = (vehicleType) => {
    const rule = pricingRules.find(r => r.vehicleTypeName === vehicleType && r.status === "ACTIVE");
    if (rule) return rule.dayPrice;
    if (vehicleType === "Xe Máy") return 5000;
    return 20000; // default to Ô Tô / Xe Vận Chuyển
  };

  // Create Booking Action
  const handleCreateBooking = async (e) => {
    e.preventDefault();

    const area = areas.find(a => a.code === selectedAreaCode);
    if (!area || area.status !== "ACTIVE") {
      alert("Khu vực đỗ xe không khả dụng.");
      return;
    }

    try {
      const newBooking = await bookingService.createBooking(area.code, durationHours, simTime);
      setActiveBooking(newBooking);
    } catch (err) {
      alert(err.message || "Đặt chỗ thất bại");
    }
  };

  // Cancel Booking Action
  const handleCancelBooking = async () => {
    if (!activeBooking) return;

    let confirmMsg = "Xác nhận hủy đặt chỗ?";
    if (activeBooking.status === BOOKING_STATUS.PAID) {
      confirmMsg = "Xác nhận hủy đặt chỗ? Phí đặt chỗ trước sẽ KHÔNG được hoàn lại.";
    }

    if (window.confirm(confirmMsg)) {
      try {
        await bookingService.cancelBooking(simTime);
        setActiveBooking(null);
      } catch (err) {
        alert(err.message || "Hủy đặt chỗ thất bại");
      }
    }
  };

  // Pay Booking Action
  const handlePayBooking = async () => {
    if (!activeBooking || activeBooking.status !== BOOKING_STATUS.PENDING) return;

    try {
      const updated = await bookingService.payBooking(simTime);
      setActiveBooking(updated);
    } catch (err) {
      alert(err.message || "Thanh toán thất bại");
    }
  };

  // Open check-in modal safely pre-selecting plate
  const handleOpenCheckInModal = () => {
    const ev = getEligibleVehicles();
    if (ev.length > 0) {
      setCheckInPlate(ev[0].plate);
      setIsManualPlate(false);
    } else {
      setCheckInPlate("");
      setIsManualPlate(true);
    }
    setShowCheckInModal(true);
  };

  // Check-In Form Submit
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!checkInPlate) {
      alert("Vui lòng chọn hoặc nhập biển số xe.");
      return;
    }

    try {
      const updated = await bookingService.checkIn(checkInPlate, simTime);
      setActiveBooking(updated);
      
      const updatedAreas = await parkingService.getAreas();
      setAreas(updatedAreas);
      setShowCheckInModal(false);
    } catch (err) {
      alert(err.message || "Check-in thất bại");
    }
  };

  // Check-Out Action
  const handleCheckOut = async () => {
    if (!activeBooking || activeBooking.status !== BOOKING_STATUS.CHECKED_IN) return;

    // Calculate actual parking duration
    const actualDurationMins = getMinutesDiff(activeBooking.checkInTime, simTime);
    const actualHours = Math.max(1, Math.ceil(actualDurationMins / 60));
    const hourlyPrice = getHourlyPrice(activeBooking.vehicleTypeName);
    const actualParkingFee = actualHours * hourlyPrice;

    const confirmMsg = `Xác nhận cho xe ${activeBooking.plate} check-out?\n\n` +
      `- Thời gian đỗ thực tế: ${actualHours} Giờ (từ ${formatDateTime(activeBooking.checkInTime)} đến ${formatDateTime(simTime)})\n` +
      `- Phí đặt chỗ trước (Giữ chỗ): ${(activeBooking.reservationFee !== undefined ? activeBooking.reservationFee : activeBooking.fee).toLocaleString()} VND (Đã thanh toán trên App)\n` +
      `- Phí gửi xe thực tế tại bãi: ${actualParkingFee.toLocaleString()} VND (Cần thanh toán tại cổng ra)`;

    if (window.confirm(confirmMsg)) {
      try {
        await bookingService.checkOut(simTime);
        setActiveBooking(null);
        
        const updatedAreas = await parkingService.getAreas();
        setAreas(updatedAreas);
      } catch (err) {
        alert(err.message || "Check-out thất bại");
      }
    }
  };

  // Timer Calculations
  const getBookingTimerDetails = () => {
    if (!activeBooking || !simTime) return null;

    const details = {
      isWarning: false,
      isGracePeriod: false,
      msg: "",
      timeLeftMins: 0
    };

    if (activeBooking.status === BOOKING_STATUS.PENDING) {
      const diff = getMinutesDiff(activeBooking.createdAt, simTime);
      details.timeLeftMins = Math.max(0, 15 - diff);
      details.msg = `Vui lòng hoàn tất thanh toán trong: ${details.timeLeftMins} phút`;
    } else if (activeBooking.status === BOOKING_STATUS.PAID) {
      const paidAtTime = activeBooking.paidAt;
      const durationMins = activeBooking.hours * 60;
      const diff = getMinutesDiff(paidAtTime, simTime);
      
      const checkInExpiry = addHours(paidAtTime, activeBooking.hours);
      const graceExpiry = addMinutes(checkInExpiry, 15);
      
      const minsToExpiry = durationMins - diff;
      const minsToGrace = (durationMins + 15) - diff;

      details.timeLeftMins = Math.max(0, minsToGrace);

      if (simTime >= addMinutes(checkInExpiry, -15) && simTime <= checkInExpiry) {
        details.isWarning = true;
        details.msg = `⚠️ CẢNH BÁO: Còn lại ${minsToExpiry} phút để check-in hoặc đặt chỗ sẽ hết hạn!`;
      } else if (simTime > checkInExpiry && simTime <= graceExpiry) {
        details.isGracePeriod = true;
        details.msg = `⏳ THỜI GIAN GIA HẠN: Đã trễ giờ đỗ xe. Bạn còn ${minsToGrace} phút gia hạn để check-in!`;
      } else {
        details.msg = `Hạn check-in còn lại (gồm 15 phút gia hạn): ${details.timeLeftMins} phút`;
      }
    }

    return details;
  };

  const timerDetails = getBookingTimerDetails();

  const getEligibleVehicles = () => {
    if (!activeBooking) return [];
    // Chỉ áp dụng đặt chỗ cho các xe hết hạn vé tháng (EXPIRED). Xe còn hạn (ACTIVE) đỗ trực tiếp tại slot cố định.
    return myVehicles.filter(v => v.vehicleTypeName === activeBooking.vehicleTypeName && v.status === "EXPIRED");
  };

  const eligibleVehicles = getEligibleVehicles();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Time Simulator Bar */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="animate-ping w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              BẢNG GIẢ LẬP THỜI GIAN HỆ THỐNG
            </span>
          </div>
          <p className="text-xl font-mono font-black text-cyan-400">
            {formatDateTime(simTime)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAdjustTime(1)} 
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white text-xs font-bold"
          >
            +1p
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAdjustTime(5)} 
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white text-xs font-bold"
          >
            +5p
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAdjustTime(15)} 
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white text-xs font-bold"
          >
            +15p
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAdjustTime(60)} 
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white text-xs font-bold"
          >
            +1h
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAdjustTime(180)} 
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white text-xs font-bold"
          >
            +3h
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetTime} 
            className="bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border-cyan-800 text-xs font-black transition flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Khôi phục thời gian thực
          </Button>
        </div>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Active booking details or Create Booking form */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeBooking ? (
            <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              
              {/* Card Header */}
              <div className={`p-6 border-b text-white flex justify-between items-center ${
                activeBooking.status === BOOKING_STATUS.PENDING 
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 border-amber-600" 
                  : activeBooking.status === BOOKING_STATUS.PAID 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-700"
                  : "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-700"
              }`}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
                    Mã đặt chỗ: {activeBooking.id}
                  </span>
                  <h3 className="text-xl font-black mt-1">
                    {activeBooking.status === BOOKING_STATUS.PENDING && "Chờ Thanh Toán Phí Đặt Trước"}
                    {activeBooking.status === BOOKING_STATUS.PAID && "Đã Thanh Toán - Chờ Check-in"}
                    {activeBooking.status === BOOKING_STATUS.CHECKED_IN && "Xe Đang Đỗ Tại Bãi"}
                  </h3>
                </div>
                
                <span className="text-3xl">
                  {activeBooking.status === BOOKING_STATUS.PENDING && "⏳"}
                  {activeBooking.status === BOOKING_STATUS.PAID && "🎫"}
                  {activeBooking.status === BOOKING_STATUS.CHECKED_IN && "🚗"}
                </span>
              </div>

              {/* Warning/Alert Display for Paid but Expiring soon or in Grace Period */}
              {timerDetails && (timerDetails.isWarning || timerDetails.isGracePeriod) && (
                <div className={`p-4 border-b flex gap-3 text-xs font-bold items-center animate-pulse ${
                  timerDetails.isWarning 
                    ? "bg-rose-50 text-rose-700 border-rose-100" 
                    : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{timerDetails.msg}</span>
                </div>
              )}

              {/* Details Body */}
              <CardContent className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-slate-400 mb-1">Vị trí đỗ gợi ý</p>
                    <p className="text-slate-800 font-extrabold text-sm">{activeBooking.areaName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Thời gian đặt</p>
                    <p className="text-slate-800 font-extrabold text-sm">{activeBooking.hours} Giờ</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Loại phương tiện</p>
                    <p className="text-slate-800 font-extrabold text-sm">{activeBooking.vehicleTypeName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Phí đặt trước</p>
                    <p className="text-indigo-600 font-black text-sm">{activeBooking.fee.toLocaleString()} VND</p>
                  </div>
                </div>

                {/* Sub-text explaining hidden internal slot ID for demo */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-500 font-mono">
                  💡 <strong>Thông tin kiểm định Demo (Nội bộ):</strong>
                  <div className="mt-1">
                    - Slot ID khóa cứng: <span className="text-indigo-600 font-bold">#{activeBooking.internalSlotId}</span>
                    <br />
                    - Mã Slot vật lý: <span className="text-indigo-600 font-bold">{activeBooking.internalSlotCode}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 italic">
                    (Backend đã tự động khóa slot này để tránh Overbooking. Driver chỉ nhìn thấy thông tin "Khu vực" gợi ý ở trên)
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>Thời điểm tạo đặt chỗ:</span>
                    <span className="text-slate-800 font-bold">{formatDateTime(activeBooking.createdAt)}</span>
                  </div>

                  {activeBooking.status === BOOKING_STATUS.PENDING && timerDetails && (
                    <div className="bg-amber-50 text-amber-800 rounded-xl p-4 flex gap-3 text-xs font-bold border border-amber-100 animate-pulse">
                      <Clock className="w-5 h-5 shrink-0 text-amber-600" />
                      <div>
                        <p>{timerDetails.msg}</p>
                        <p className="text-[10px] font-medium text-amber-600 mt-1 font-sans">
                          Nếu không hoàn tất thanh toán trước thời hạn, hệ thống sẽ tự động hủy yêu cầu đỗ xe này.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeBooking.status === BOOKING_STATUS.PAID && (
                    <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>Thời điểm thanh toán:</span>
                        <span className="text-slate-800 font-bold">{formatDateTime(activeBooking.paidAt)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>Hạn check-in chính thức:</span>
                        <span className="text-slate-800 font-bold">{formatDateTime(addHours(activeBooking.paidAt, activeBooking.hours))}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>Hạn giữ chỗ tối đa (15p gia hạn):</span>
                        <span className="text-rose-600 font-black">{formatDateTime(addMinutes(addHours(activeBooking.paidAt, activeBooking.hours), 15))}</span>
                      </div>
                      {timerDetails && (
                        <p className="text-[11px] font-bold text-indigo-600 border-t pt-2 mt-2 font-sans">
                          ⏱️ {timerDetails.msg}
                        </p>
                      )}
                    </div>
                  )}

                  {activeBooking.status === BOOKING_STATUS.CHECKED_IN && (
                    <div className="space-y-3 bg-emerald-50 text-emerald-900 rounded-xl p-4 border border-emerald-100">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Biển số xe đỗ thực tế:</span>
                        <LicensePlate plate={activeBooking.plate} size="md" />
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Vị trí khu vực:</span>
                        <span className="text-sm bg-white px-2 py-0.5 border border-emerald-200 rounded text-emerald-700 font-extrabold">{activeBooking.areaName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>Thời điểm xe vào (Check-in):</span>
                        <span>{formatDateTime(activeBooking.checkInTime)}</span>
                      </div>
                      <div className="border-t border-emerald-200 pt-3 mt-1">
                        <Button 
                          type="button"
                          onClick={handleCheckOut}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow transition"
                        >
                          Giả lập Xe Ra (Check-out & Thanh Toán tại Cổng)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex gap-3 border-t border-slate-100 pt-6">
                  {activeBooking.status === BOOKING_STATUS.PENDING && (
                    <>
                      <Button 
                        onClick={handlePayBooking}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" /> Giả lập Thanh Toán Thành Công
                      </Button>
                      <Button 
                        onClick={handleCancelBooking}
                        variant="secondary"
                        className="py-2.5 px-4 rounded-xl text-sm transition"
                      >
                        Hủy Đặt
                      </Button>
                    </>
                  )}

                  {activeBooking.status === BOOKING_STATUS.PAID && (
                    <div className="flex flex-col items-center gap-6 w-full p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-center space-y-2">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                          MÃ VÉ ĐIỆN TỬ (QR CODE)
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-sm">
                          Trình diện mã QR này tại cổng vận hành hoặc thiết bị quét để nhân viên bãi xe xác nhận vào đỗ.
                        </p>
                      </div>

                      {/* QR Image */}
                      <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${activeBooking.id}&color=0f172a`} 
                          alt="Booking QR Code" 
                          className="w-44 h-44 border border-slate-200 rounded-xl p-1 bg-white"
                        />
                        <span className="text-xs font-mono font-black text-slate-700 mt-3 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                          {activeBooking.id}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 w-full border-t border-slate-200 pt-4">
                        <Button 
                          type="button"
                          onClick={handleOpenCheckInModal}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow transition flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-4 h-4" /> Giả lập Quét QR (Cổng Vào Check-in)
                        </Button>
                        <div className="flex gap-3 w-full">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              const latest = await bookingService.getActiveBooking();
                              setActiveBooking(latest);
                              if (!latest) {
                                alert("Đặt chỗ đã được staff quét xác nhận thành công!");
                              }
                            }}
                            className="flex-1 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <RefreshCw className="w-4 h-4" /> Đồng bộ trạng thái
                          </Button>
                          <Button 
                            type="button"
                            variant="destructive"
                            onClick={handleCancelBooking}
                            className="flex-1 font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" /> Hủy đặt chỗ
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>

            </Card>
          ) : (
            // Form Đặt Chỗ
            <Card className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide mb-6">
                Đặt Giữ Chỗ Đặt Trước (Booking)
              </h3>

              <form onSubmit={handleCreateBooking} className="space-y-6">
                
                {/* 1. Area Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Chọn khu vực đỗ xe gợi ý
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {areas.filter(a => a.status === "ACTIVE" && (a.floorCode === "B1" || a.floorCode === "B2")).map(area => {
                      const maxCap = area.maxCapacity || area.totalSlots || 0;
                      const current = area.currentCount !== undefined ? area.currentCount : (maxCap - (area.availableSlots || 0));
                      const available = maxCap - current;
                      const isCar = area.vehicleTypeName === "Ô Tô";
                      const price = getHourlyPrice(area.vehicleTypeName);

                      return (
                        <div 
                          key={area.code}
                          onClick={() => setSelectedAreaCode(area.code)}
                          className={`p-4.5 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
                            selectedAreaCode === area.code 
                              ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 ring-2 ring-indigo-600/20" 
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <span className="text-sm font-extrabold block text-slate-800">{area.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                              Đỗ {area.vehicleTypeName} (Quản lý {isCar ? "Slot" : "mật độ"} nội bộ)
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-6">
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded">
                              Còn {available} chỗ trống
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-indigo-600">{(price / 1000)}k/h</span>
                              <span className="text-lg">{isCar ? "🚗" : "🏍️"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Duration select */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Số giờ đặt trước
                  </label>
                  <Select 
                    value={String(durationHours)} 
                    onValueChange={(val) => setDurationHours(parseInt(val))}
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200">
                      <SelectValue placeholder="Chọn số giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Giờ</SelectItem>
                      <SelectItem value="2">2 Giờ</SelectItem>
                      <SelectItem value="3">3 Giờ (Mặc định)</SelectItem>
                      <SelectItem value="4">4 Giờ</SelectItem>
                      <SelectItem value="6">6 Giờ</SelectItem>
                      <SelectItem value="8">8 Giờ</SelectItem>
                      <SelectItem value="12">12 Giờ</SelectItem>
                      <SelectItem value="24">24 Giờ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Dynamic Price info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Đơn giá đỗ xe
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {getHourlyPrice(selectedAreaCode.startsWith("B2") ? "Ô Tô" : "Xe Máy").toLocaleString()} VND / giờ ({selectedAreaCode.startsWith("B2") ? "Ô Tô" : "Xe Máy"})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Tổng chi phí đặt trước
                    </span>
                    <span className="text-xl font-black text-indigo-600">
                      {(durationHours * getHourlyPrice(selectedAreaCode.startsWith("B2") ? "Ô Tô" : "Xe Máy")).toLocaleString()} VND
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition"
                >
                  Xác nhận đặt giữ chỗ đỗ xe
                </Button>
              </form>
            </Card>
          )}

        </div>

        {/* Right Section: Rules & Classifications */}
        <div className="space-y-6">
          
          {/* Categorization Info Box */}
          <Card className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              Phân loại người dùng
            </h4>
            
            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="border-l-4 border-indigo-500 pl-3">
                <p className="font-extrabold text-slate-800">1. Cư Dân (Resident)</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Là người sinh sống tại tòa nhà. Có quyền đăng ký vé tháng dài hạn theo các biển số xe cố định và được hưởng quyền lợi đỗ xe ưu đãi.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-3">
                <p className="font-extrabold text-slate-800">2. Driver đặt trước (Registered)</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Là tài xế đăng ký tài khoản thành viên để đặt chỗ trước trực tuyến qua App. Cho phép khóa cứng slot và thanh toán trực tiếp.
                </p>
              </div>

              <div className="border-l-4 border-slate-400 pl-3">
                <p className="font-extrabold text-slate-800">3. Driver vãng lai (Casual)</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Không đăng ký tài khoản, gửi xe theo lượt trực tiếp tại cổng kiểm soát đầu vào (lấy thẻ) và thanh toán tiền mặt/QR khi ra bãi.
                </p>
              </div>
            </div>
          </Card>

          {/* Rules / Business Logic Widget */}
          <Card className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Nghiệp Vụ Đặt Chỗ
            </h4>
            
            <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">1.</span>
                <span>Chỉ đặt chỗ trước thành công khi khu vực đỗ xe còn trống tối thiểu 1 chỗ.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">2.</span>
                <span>
                  Sau khi gửi yêu cầu, bạn có **15 phút** để thanh toán phí đặt trước. Quá hạn hệ thống hủy tự động.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">3.</span>
                <span>
                  Thời gian đặt đếm ngược từ lúc thanh toán. Bạn có **X giờ** đỗ xe + **15 phút gia hạn** check-in tối đa.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">4.</span>
                <span>
                  Trước khi hết hạn đặt chỗ **15 phút**, một thông báo cảnh báo sẽ xuất hiện trên màn hình Driver.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">5.</span>
                <span>
                  Tài xế có thể **Hủy đặt chỗ** trước khi check-in, nhưng **không được hoàn lại tiền** phí đã đóng.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">6.</span>
                <span>
                  Chỉ check-in booking cho xe chưa đăng kí vé tháng hoặc vé tháng hết hạn. Xe còn hạn (ACTIVE) được đỗ trực tiếp mà không cần đặt trước.
                </span>
              </li>
            </ul>
          </Card>

        </div>

      </div>

      {/* 2. Check-In Modal for selecting vehicle */}
      <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <DialogTitle className="text-md font-black text-slate-800 uppercase tracking-wide">
              Giả Lập Cổng Kiểm Soát (Staff Cổng Vào)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1 font-semibold">
              Nhân viên (Staff) quét hoặc nhập biển số xe thực tế khi xe đi vào cổng (loại: {activeBooking?.vehicleTypeName})
            </DialogDescription>
          </div>

          <form onSubmit={handleCheckInSubmit} className="p-6 space-y-4">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isManualPlate ? "Nhập biển số xe đỗ thực tế" : "Chọn biển số xe đỗ"}
                </label>
                {myVehicles.length > 0 && eligibleVehicles.length > 0 && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      const nextManual = !isManualPlate;
                      setIsManualPlate(nextManual);
                      setCheckInPlate(nextManual ? "" : eligibleVehicles[0].plate);
                    }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline p-0 h-auto cursor-pointer"
                  >
                    {isManualPlate ? "Chọn từ danh sách xe của bạn" : "Nhập biển số xe khác"}
                  </Button>
                )}
              </div>
              
              {isManualPlate ? (
                <div>
                  <Input 
                    type="text"
                    required
                    value={checkInPlate}
                    onChange={(e) => setCheckInPlate(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: 30H-123.45"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 font-bold font-mono tracking-wider outline-none"
                  />
                  {myVehicles.length > 0 && eligibleVehicles.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-medium leading-relaxed font-sans mt-1">
                      ⚠️ Bạn không có xe vé tháng hết hạn nào thuộc loại này. Vui lòng nhập biển số xe khác để check-in đỗ theo phiên đặt trước này. (Xe còn hạn sẽ tự động đỗ trực tiếp vào slot riêng không cần booking).
                    </p>
                  )}
                  {myVehicles.length > 0 && eligibleVehicles.length > 0 && (
                    <p className="text-[10px] text-indigo-600 font-medium leading-relaxed font-sans mt-1">
                      💡 Nhập biển số xe khác không có sẵn trong danh sách vé tháng để gửi theo phiên đặt chỗ này.
                    </p>
                  )}
                </div>
              ) : (
                <Select 
                  value={checkInPlate} 
                  onValueChange={setCheckInPlate}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200">
                    <SelectValue placeholder="Chọn biển số xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleVehicles.map(v => (
                      <SelectItem key={v.id} value={v.plate}>
                        {v.plate} (Vé Tháng Hết Hạn)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 font-medium">
              🔔 Hệ thống ghi nhận xe đi vào cổng và tự động khớp biển số với mã Slot nội bộ <strong>{activeBooking?.internalSlotCode}</strong> đã được khóa cứng trước đó tại <strong>{activeBooking?.areaName}</strong>.
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
              <Button
                type="submit"
                disabled={!checkInPlate.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Xác nhận cho xe vào (Đồng bộ Check-in)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckInModal(false)}
                className="font-bold text-slate-700"
              >
                Đóng
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
