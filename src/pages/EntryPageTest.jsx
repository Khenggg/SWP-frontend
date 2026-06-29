import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  CreditCard, 
  RefreshCw, 
  Plus, 
  Check, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  ChevronDown, 
  AlertTriangle, 
  AlertCircle, 
  Eye, 
  Play, 
  CheckSquare, 
  Square,
  QrCode,
  Info,
  LogIn
} from 'lucide-react';

// Import official shadcn/ui components from the project
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

export default function EntryPageTest() {
  // 1. Form States
  const [plateNumber, setPlateNumber] = useState('30F-123.45');
  const [cardCode, setCardCode] = useState('TH-00112345');
  const [vehicleType, setVehicleType] = useState('car'); // motorbike, car, truck, bicycle
  const [driverGroup, setDriverGroup] = useState('resident'); // resident, visitor
  const [gate, setGate] = useState('A1');
  const [entryTime, setEntryTime] = useState('20/05/2025 09:24:18');

  // 2. Interactive & UI States
  const [isBarrierOpen, setIsBarrierOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:24:18');
  const [currentDate, setCurrentDate] = useState('20/05/2025 (Thứ Ba)');
  const [showNotification, setShowNotification] = useState(null); // { type, text }

  // 3. System checks state (dynamically computed)
  const isCardValid = cardCode.startsWith('TH-') && cardCode.length >= 8;
  const isPlateValid = plateNumber.trim().length >= 5;
  const isNoDuplicateSession = plateNumber !== '29A-456.78'; // mock check
  const isVehicleTypeValid = ['car', 'motorbike', 'truck'].includes(vehicleType);

  const allChecksPassed = isCardValid && isPlateValid && isNoDuplicateSession && isVehicleTypeValid;

  // 4. Recent Entries List State
  const [recentEntries, setRecentEntries] = useState([
    { plate: '30F-123.45', type: 'car', gate: 'Cổng A1', time: '09:24:18 20/05/2025' },
    { plate: '29A-456.78', type: 'motorbike', gate: 'Cổng A1', time: '09:20:45 20/05/2025' },
    { plate: '51H-789.01', type: 'car', gate: 'Cổng A2', time: '09:18:32 20/05/2025' },
    { plate: '15C-345.67', type: 'truck', gate: 'Cổng B1', time: '09:15:10 20/05/2025' },
    { plate: '43B-234.56', type: 'car', gate: 'Cổng A1', time: '09:12:05 20/05/2025' }
  ]);

  // 5. Booking Info matching the current plate
  const hasBooking = plateNumber.toUpperCase().replace(/[-.]/g, '') === '30F12345';

  // Live Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Helper
  const getVehicleLabel = (type) => {
    switch (type) {
      case 'car': return 'Ô tô';
      case 'motorbike': return 'Xe máy';
      case 'truck': return 'Xe tải';
      case 'bicycle': return 'Xe đạp';
      default: return 'Khác';
    }
  };

  // Actions
  const handleOpenBarrier = () => {
    setIsBarrierOpen(true);
    triggerNotification('success', 'Đã gửi lệnh mở barrier thành công!');
    setTimeout(() => setIsBarrierOpen(false), 5000);
  };

  const handleCreateSession = () => {
    if (!allChecksPassed) {
      triggerNotification('error', 'Không thể tạo phiên! Vui lòng kiểm tra lại hệ thống.');
      return;
    }
    // Add to recent entries
    const newEntry = {
      plate: plateNumber,
      type: vehicleType,
      gate: `Cổng ${gate}`,
      time: `${currentTime} 20/05/2025`
    };
    setRecentEntries([newEntry, ...recentEntries.slice(0, 4)]);
    triggerNotification('success', `Đã tạo phiên đỗ xe thành công cho biển số ${plateNumber}!`);
  };

  const triggerNotification = (type, text) => {
    setShowNotification({ type, text });
    setTimeout(() => setShowNotification(null), 4500);
  };

  const handleRecheck = () => {
    triggerNotification('info', 'Đang quét lại dữ liệu và kiểm tra hệ thống...');
  };

  const handleScanPlate = () => {
    setPlateNumber('30F-123.45');
    triggerNotification('success', 'Nhận diện biển số hoàn tất: 30F-123.45');
  };

  const handleScanCard = () => {
    setCardCode('TH-00112345');
    triggerNotification('success', 'Đã quét thẻ: TH-00112345');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6">
      {/* Toast Notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 border ${
          showNotification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          showNotification.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {showNotification.type === 'success' && <CheckCircle className="h-6 w-6 text-emerald-600 animate-bounce shrink-0" />}
          {showNotification.type === 'error' && <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />}
          {showNotification.type === 'info' && <RefreshCw className="h-6 w-6 text-blue-600 animate-spin shrink-0" />}
          <span className="font-semibold text-sm">{showNotification.text}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Xe vào
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Quản lý phương tiện ra vào bãi xe</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Active Gate Box */}
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cổng vào</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-blue-600">Cổng {gate}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Time Clock Box */}
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-xs min-w-[200px]">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{currentTime}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">{currentDate}</p>
            </div>
          </div>

          {/* User Profile Box */}
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-xs ml-auto lg:ml-0">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Nguyễn Văn An</p>
              <p className="text-[11px] font-medium text-slate-400">Nhân viên trực</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 ml-2 cursor-pointer" />
          </div>
        </div>
      </header>

      {/* THREE-COLUMN GRID LAYOUT */}
      <main className="grid grid-cols-1 xl:grid-cols-10 gap-6">
        
        {/* ================= COLUMN 1 (40% width / 4 Cols) ================= */}
        <section className="xl:col-span-4 flex flex-col gap-6">
          
          {/* CARD 1: Camera nhận diện */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col p-0 gap-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 w-full">
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">1</span>
                <h3 className="font-bold text-slate-800">Camera nhận diện</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Badge Biển số đã nhận diện */}
                <Badge variant={isPlateValid ? "default" : "outline"} className={`h-6.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-none transition-all ${
                  isPlateValid ? 'bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-transparent'
                }`}>
                  {isPlateValid ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  Biển số đã nhận diện
                </Badge>
                {/* Badge Thẻ hợp lệ */}
                <Badge variant={isCardValid ? "default" : "outline"} className={`h-6.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-none transition-all ${
                  isCardValid ? 'bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-transparent'
                }`}>
                  <CreditCard className={`w-3.5 h-3.5 ${isCardValid ? 'text-emerald-600' : 'text-slate-400'}`} />
                  Thẻ hợp lệ
                </Badge>
                {/* Badge Sẵn sàng tạo phiên */}
                <Badge variant={allChecksPassed ? "default" : "outline"} className={`h-6.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-none transition-all ${
                  allChecksPassed ? 'bg-indigo-50 hover:bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-400 border-transparent'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${allChecksPassed ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`}></span>
                  Sẵn sàng tạo phiên
                </Badge>
              </div>
            </div>

            {/* Video Feed Box */}
            <div className="relative bg-slate-950 aspect-[16/9] w-full flex items-center justify-center overflow-hidden group">
              {/* Car Camera Feed Mockup */}
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" 
                alt="Camera feed" 
                className="w-full h-full object-cover opacity-80"
              />
              
              {/* Camera Info Overlay */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-1 rounded flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span>CAM_ENTRY_01 - LIVE</span>
              </div>

              {/* Gate Tag Indicator */}
              <div className="absolute top-4 right-4 bg-emerald-600 text-white font-bold text-sm px-3 py-1 rounded-lg shadow-md">
                {gate}
              </div>

              {/* Plate Bounding Box Detection overlay */}
              {isPlateValid && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 border-2 border-emerald-500 bg-black/75 rounded-lg px-4 py-2 text-center shadow-lg backdrop-blur-xs">
                  <p className="text-white text-lg font-black tracking-wider leading-none">{plateNumber}</p>
                  <p className="text-emerald-400 text-[10px] font-bold mt-1 tracking-widest uppercase">CONFIDENCE: 96%</p>
                </div>
              )}

              {/* Barrier status indicator overlay */}
              {isBarrierOpen && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex items-center justify-center">
                  <div className="bg-emerald-600 text-white font-black text-xl px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-400 animate-bounce">
                    <CheckCircle className="w-7 h-7" />
                    CỔNG ĐANG MỞ (BARRIER OPEN)
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* CARD 3: Kiểm tra hệ thống */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">3</span>
              <h3 className="font-bold text-slate-800">Kiểm tra hệ thống</h3>
            </div>

            {/* Check Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
              {/* Check 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Thẻ đang AVAILABLE</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${isCardValid ? 'text-slate-700' : 'text-rose-600'}`}>
                    {isCardValid ? 'Hợp lệ đến 31/12/2025' : 'Thẻ không khả dụng'}
                  </span>
                  {isCardValid ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Check 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Không có phiên đang mở</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${isNoDuplicateSession ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isNoDuplicateSession ? 'OK' : 'Trùng biển số hoạt động'}
                  </span>
                  {isNoDuplicateSession ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Check 3 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Loại xe hợp lệ</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${isVehicleTypeValid ? 'text-slate-700' : 'text-rose-600'}`}>
                    {isVehicleTypeValid ? getVehicleLabel(vehicleType) : 'Không xác định'}
                  </span>
                  {isVehicleTypeValid ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Check 4 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Không trùng biển số</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">OK</span>
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>
              </div>
            </div>

            {/* Banner summary */}
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors duration-350 ${
              allChecksPassed 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {allChecksPassed ? (
                <>
                  <ShieldCheck className="h-5.5 w-5.5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">
                    Tất cả điều kiện kiểm tra đều hợp lệ. Có thể tạo phiên đỗ xe.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5.5 w-5.5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">
                    Hệ thống ghi nhận một số kiểm tra không đạt. Vui lòng kiểm tra lại biển số hoặc mã thẻ.
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* CARD 5: Thao tác */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">5</span>
              <h3 className="font-bold text-slate-800">Thao tác</h3>
            </div>

            {/* Quick Actions Buttons Row */}
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline"
                onClick={handleScanPlate}
                className="h-11 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Camera className="h-4 w-4 shrink-0" />
                Quét biển số
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleScanCard}
                className="h-11 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                Quét thẻ
              </Button>

              <Button 
                variant="outline"
                onClick={handleRecheck}
                className="h-11 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                Kiểm tra lại
              </Button>
            </div>

            {/* Large Buttons Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blue CTA */}
              <Button
                onClick={handleCreateSession}
                className={`h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-sm shadow-md transition cursor-pointer ${
                  allChecksPassed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border-transparent'
                }`}
              >
                <Plus className="h-5 w-5 shrink-0" />
                <div className="text-left">
                  <p className="font-extrabold leading-tight">Tạo parking session</p>
                  <p className="text-[10px] opacity-80 font-medium">Tạo phiên đỗ xe mới</p>
                </div>
              </Button>

              {/* Green CTA */}
              <Button
                onClick={handleOpenBarrier}
                className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-3 font-bold text-sm transition cursor-pointer border-transparent"
              >
                <LogIn className="h-5 w-5 rotate-270 shrink-0" />
                <div className="text-left">
                  <p className="font-extrabold leading-tight">Mở barrier</p>
                  <p className="text-[10px] opacity-80 font-medium">Mở cổng cho xe vào</p>
                </div>
              </Button>
            </div>

            {/* Target Footer */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-3 mt-1">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Thời gian xử lý mục tiêu:</span>
              <span className="text-blue-600 font-bold">&lt; 20 giây</span>
            </div>
          </Card>

        </section>

        {/* ================= COLUMN 2 (30% width / 3 Cols) ================= */}
        <section className="xl:col-span-3 flex flex-col gap-6">
          
          {/* CARD 2: Thông tin xe vào */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">2</span>
              <h3 className="font-bold text-slate-800">Thông tin xe vào</h3>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              {/* Field: License Plate */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Biển số <span className="text-rose-500">*</span></label>
                <Input 
                  type="text" 
                  value={plateNumber} 
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="h-10 px-4 rounded-xl font-bold focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-800"
                  placeholder="30F-123.45"
                />
              </div>

              {/* Field: Card Code */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Mã thẻ</label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={cardCode} 
                    onChange={(e) => setCardCode(e.target.value)}
                    className="h-10 px-4 pr-10 rounded-xl font-mono font-bold focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-800"
                    placeholder="TH-00112345"
                  />
                  {isCardValid && (
                    <CheckCircle className="absolute right-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Field: Vehicle Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Loại xe <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                  {['motorbike', 'car', 'truck', 'bicycle'].map((type) => {
                    const label = type === 'motorbike' ? 'Xe máy' : type === 'car' ? 'Ô tô' : type === 'truck' ? 'Xe tải' : 'Xe đạp';
                    return (
                      <button
                        key={type}
                        onClick={() => setVehicleType(type)}
                        className={`py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          vehicleType === type
                            ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field: Driver Group */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Nhóm tài xế <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                  {['resident', 'visitor'].map((grp) => {
                    const label = grp === 'resident' ? 'Cư dân' : 'Khách vãng lai';
                    return (
                      <button
                        key={grp}
                        onClick={() => setDriverGroup(grp)}
                        className={`py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          driverGroup === grp
                            ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field: Gate */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Cổng vào <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select 
                    value={gate}
                    onChange={(e) => setGate(e.target.value)}
                    className="w-full h-10 px-4 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-blue-500 appearance-none bg-white text-slate-800 cursor-pointer"
                  >
                    <option value="A1">Cổng A1</option>
                    <option value="A2">Cổng A2</option>
                    <option value="B1">Cổng B1</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Field: Time In */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Thời gian vào</label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="h-10 px-4 pr-10 rounded-xl font-bold focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-500 font-medium"
                  />
                  <Calendar className="absolute right-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Thumbnail Attachments */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Vehicle photo */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">Ảnh xe</span>
                  <div className="bg-slate-100 rounded-xl overflow-hidden aspect-[4/3] relative border border-slate-150">
                    <img 
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80" 
                      alt="Car attachment" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Plate Crop Photo */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">Ảnh biển số</span>
                  <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-800 p-2">
                    <div className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-white font-mono font-black tracking-wider text-xs shadow-inner">
                      30F-123.45
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 4: Gợi ý vị trí đỗ */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">4</span>
                <h3 className="font-bold text-slate-800">Gợi ý vị trí đỗ</h3>
              </div>
              <MapPin className="h-5 w-5 text-blue-600 cursor-pointer" />
            </div>

            {/* Suggestions list */}
            <div className="flex flex-col gap-2.5">
              {/* Sug 1 */}
              <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8.5 h-8.5 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    🚘
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">Ô tô tiện tại</p>
                    <p className="text-sm font-extrabold text-blue-700 mt-1">B2 - Slot A12</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border-transparent shadow-none">
                  Đề xuất tốt nhất
                </Badge>
              </div>

              {/* Sug 2 */}
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="w-8.5 h-8.5 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                  🛵
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">Xe máy</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">B1 - Khu C</p>
                </div>
              </div>

              {/* Sug 3 */}
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="w-8.5 h-8.5 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                  🚛
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">Xe tải</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">B3 - Truck Bay 03</p>
                </div>
              </div>
            </div>

            {/* Occupancy visual grid panel */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              {/* Floor 1 */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-700">B1 - Khu C</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">48%</span>
                    <span className="text-slate-400 text-[10px] font-medium">Còn 34/64 trống</span>
                  </div>
                </div>
                {/* Visual Cells Grid */}
                <div className="grid grid-cols-8 gap-1.5">
                  {[true, true, false, false, true, false, false, false].map((occ, idx) => (
                    <div 
                      key={idx} 
                      className={`h-5 rounded-md border ${
                        occ ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200 hover:border-blue-400 cursor-pointer'
                      }`}
                      title={occ ? 'Đã đỗ' : 'Còn trống'}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Floor 2 */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-700">B2 - Khu A</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">42%</span>
                    <span className="text-slate-400 text-[10px] font-medium">Còn 58/138 trống</span>
                  </div>
                </div>
                {/* Visual Cells Grid with dynamic suggestion slot */}
                <div className="grid grid-cols-8 gap-1.5">
                  {[false, false, true, true, 'suggested', false, false, false].map((state, idx) => (
                    <div 
                      key={idx} 
                      className={`h-5 rounded-md border ${
                        state === 'suggested' ? 'bg-blue-50 border-emerald-500 border-2 ring-2 ring-emerald-100 animate-pulse' :
                        state ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200 hover:border-blue-400 cursor-pointer'
                      }`}
                      title={state === 'suggested' ? 'Ví trí đề xuất: Slot A12' : state ? 'Đã đỗ' : 'Còn trống'}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Floor 3 */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-700">B3 - Khu B</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">23%</span>
                    <span className="text-slate-400 text-[10px] font-medium">Còn 23/tổng trống</span>
                  </div>
                </div>
                {/* Visual Cells Grid */}
                <div className="grid grid-cols-8 gap-1.5">
                  {[false, true, false, false, true, false, false, false].map((occ, idx) => (
                    <div 
                      key={idx} 
                      className={`h-5 rounded-md border ${
                        occ ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200 hover:border-blue-400 cursor-pointer'
                      }`}
                      title={occ ? 'Đã đỗ' : 'Còn trống'}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white"></span>
                  <span>Trống</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded border border-emerald-500 bg-blue-50"></span>
                  <span>Đề xuất</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-slate-300"></span>
                  <span>Đã chiếm</span>
                </div>
              </div>
            </div>
          </Card>

        </section>

        {/* ================= COLUMN 3 (30% width / 3 Cols) ================= */}
        <section className="xl:col-span-3 flex flex-col gap-6">
          
          {/* CARD: Thông tin booking / QR */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800">Thống tin booking / QR</h3>

            {hasBooking ? (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                {/* Widget 1: Booking Status Check */}
                <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <QrCode className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-blue-800 leading-none">QR đã nhận diện</h4>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">Mã booking: BK-250520-018</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shrink-0 border-transparent shadow-none">
                      Hợp lệ
                    </Badge>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-50 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Loại vào:</span>
                    <span className="font-bold text-slate-700">Đặt chỗ trước</span>
                  </div>
                </div>

                {/* Widget 2: Pre-booked Vehicle Info */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-emerald-500">🚘</span>
                    <span>Thông tin xe đặt chỗ</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Biển số:</span>
                      <span className="font-bold text-slate-800">30F-123.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Loại xe:</span>
                      <span className="font-bold text-slate-800">Ô tô</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Tài xế:</span>
                      <span className="font-bold text-slate-800">Nguyễn Minh Khang</span>
                    </div>
                  </div>
                </div>

                {/* Widget 3: Booked Location */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span className="text-amber-500">📍</span>
                      <span>Vị trí đã đặt</span>
                    </div>
                    <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border-transparent shadow-none">
                      Có thể cho xe vào
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Tầng/Khu:</span>
                      <span className="font-bold text-slate-800">B2 - Khu A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Slot:</span>
                      <span className="font-bold text-blue-600">A12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Khung giờ:</span>
                      <span className="font-bold text-slate-800">09:00 - 13:00</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 px-4 border border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center gap-2">
                <QrCode className="h-10 w-10 text-slate-300" />
                <p className="text-xs font-bold text-slate-400">Không tìm thấy thông tin đặt chỗ trước</p>
                <p className="text-[10px] text-slate-400 max-w-[180px]">
                  (Nhập biển số 30F-123.45 để kiểm tra thông tin đặt chỗ/QR)
                </p>
              </div>
            )}
          </Card>

          {/* CARD: Lượt xe vào gần đây */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Lượt xe vào gần đây</h3>
              <a href="#/recent" className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</a>
            </div>

            {/* Entries Table */}
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="h-8 font-bold text-slate-400 text-xs px-0">Biển số</TableHead>
                  <TableHead className="h-8 font-bold text-slate-400 text-xs">Loại</TableHead>
                  <TableHead className="h-8 font-bold text-slate-400 text-xs">Cổng</TableHead>
                  <TableHead className="h-8 font-bold text-slate-400 text-xs text-right pr-0">Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.map((entry, index) => (
                  <TableRow key={index} className="hover:bg-slate-50/50 border-slate-50">
                    <TableCell className="py-2.5 font-extrabold text-slate-800 flex items-center gap-1.5 px-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      {entry.plate}
                    </TableCell>
                    <TableCell className="py-2.5 font-semibold text-slate-600">
                      {entry.type === 'car' ? '🚘' : entry.type === 'motorbike' ? '🛵' : '🚛'}
                    </TableCell>
                    <TableCell className="py-2.5 font-semibold text-slate-500">{entry.gate.replace('Cổng ', '')}</TableCell>
                    <TableCell className="py-2.5 text-right font-medium text-slate-400 pr-0">{entry.time.split(' ')[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Footer sync indicator */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-3">
              <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
              <span>Dữ liệu được cập nhật mỗi 10 giây</span>
            </div>
          </Card>

        </section>

      </main>
    </div>
  );
}
