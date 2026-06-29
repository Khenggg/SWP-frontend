/**
 * mockData.js - Dữ liệu giả lập tập trung cho tất cả pages Sprint 1
 * Khi backend sẵn sàng, từng module sẽ thay bằng API call thật (Phase C)
 */

// ===========================================================================
// PARKING INFO
// ===========================================================================
export const MOCK_PARKING_INFO = {
  name: "Bãi Đỗ Xe Tòa Nhà Sky Center",
  status: "OPEN", // OPEN | CLOSED | MAINTENANCE
  address: "12 Tân Thắng, Phường Sơn Kỳ, Quận Tân Phú, TP.HCM",
  hotline: "1800 1234",
  openingHours: "06:00 - 22:00",
  totalFloors: 3,
  totalAreas: 4,
  totalSlots: 40,
  availableSlots: 20,
  supportNote: "Hỗ trợ khách hàng từ 07:00 - 20:00 các ngày trong tuần. Hệ thống chỉ thực hiện giám sát & quản lý vị trí (slot) đỗ cho Xe Ô Tô tại Tầng B2. Xe Máy (Tầng B1) và Xe Vận Chuyển (Tầng B3) tự quản lý và đỗ theo điều phối.",
  lastUpdated: "2026-05-28T07:00:00Z",
};

// ===========================================================================
// VEHICLE TYPES
// ===========================================================================
export const MOCK_VEHICLE_TYPES = [
  { id: 1, code: "MOTORBIKE", name: "Xe Máy" },
  { id: 2, code: "CAR", name: "Ô Tô" },
  { id: 3, code: "TRANSPORT", name: "Xe Vận Chuyển" },
];

// ===========================================================================
// PUBLIC PRICING
// ===========================================================================
export const MOCK_PRICING_RULES = [
  {
    id: 1,
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    dayPrice: 5000,
    nightPrice: 8000,
    monthlyPrice: 300000,
    lostCardFee: 50000,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
  },
  {
    id: 2,
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    dayPrice: 20000,
    nightPrice: 30000,
    monthlyPrice: 1200000,
    lostCardFee: 100000,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
  },
  {
    id: 3,
    vehicleTypeId: 3,
    vehicleTypeName: "Xe Vận Chuyển",
    dayPrice: 40000,
    nightPrice: 60000,
    monthlyPrice: 2000000,
    lostCardFee: 150000,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
  },
];

// ===========================================================================
// FLOORS
// ===========================================================================
export const MOCK_FLOORS = [
  { id: 1, code: "B1", name: "Tầng B1 (Xe Máy)", status: "ACTIVE", totalAreas: 2, totalSlots: 150 },
  { id: 2, code: "B2", name: "Tầng B2 (Ô Tô)", status: "ACTIVE", totalAreas: 2, totalSlots: 40 },
  { id: 3, code: "B3", name: "Tầng B3 (Xe Vận Chuyển)", status: "ACTIVE", totalAreas: 2, totalSlots: 50 },
];

// ===========================================================================
// AREAS
// ===========================================================================
export const MOCK_AREAS = [
  // Tầng B1 (Xe Máy) - Quản lý bằng độ phủ
  { id: 1, floorId: 1, floorCode: "B1", code: "B1-A", name: "Khu A - Xe Máy Thường", vehicleTypeName: "Xe Máy", priority: 1, status: "ACTIVE", maxCapacity: 100, currentCount: 65, isDensityManaged: true },
  { id: 2, floorId: 1, floorCode: "B1", code: "B1-B", name: "Khu B - Xe Máy Điện", vehicleTypeName: "Xe Máy", priority: 2, status: "ACTIVE", maxCapacity: 50, currentCount: 31, isDensityManaged: true },
  
  // Tầng B2 (Xe Ô Tô) - Quản lý bằng Slot
  { id: 3, floorId: 2, floorCode: "B2", code: "B2-A", name: "Khu A - Ô Tô", vehicleTypeName: "Ô Tô", priority: 1, status: "ACTIVE", totalSlots: 20, availableSlots: 13, isDensityManaged: false },
  { id: 4, floorId: 2, floorCode: "B2", code: "B2-B", name: "Khu B - Ô Tô", vehicleTypeName: "Ô Tô", priority: 2, status: "ACTIVE", totalSlots: 20, availableSlots: 7, isDensityManaged: false },
  
  // Tầng B3 (Xe Vận Chuyển) - Quản lý bằng độ phủ
  { id: 5, floorId: 3, floorCode: "B3", code: "B3-A", name: "Khu A - Xe Tải Nhẹ", vehicleTypeName: "Xe Vận Chuyển", priority: 1, status: "ACTIVE", maxCapacity: 30, currentCount: 12, isDensityManaged: true },
  { id: 6, floorId: 3, floorCode: "B3", code: "B3-B", name: "Khu B - Xe Tải Nặng", vehicleTypeName: "Xe Vận Chuyển", priority: 2, status: "ACTIVE", maxCapacity: 20, currentCount: 12, isDensityManaged: true }
];

// ===========================================================================
// SLOTS
// ===========================================================================
export const MOCK_SLOTS = [
  // Khu B2-A (20 Slots)
  { id: 1, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-001", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 2, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-002", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 3, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-003", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-101" },
  { id: 4, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-004", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-102" },
  { id: 5, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-005", vehicleTypeName: "Ô Tô", status: "MAINTENANCE" },
  { id: 6, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-006", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 7, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-007", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 8, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-008", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-103" },
  { id: 9, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-009", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 10, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-010", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 11, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-011", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-104" },
  { id: 12, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-012", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 13, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-013", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 14, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-014", vehicleTypeName: "Ô Tô", status: "LOCKED" },
  { id: 15, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-015", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 16, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-016", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 17, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-017", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-105" },
  { id: 18, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-018", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 19, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-019", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 20, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-020", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },

  // Khu B2-B (20 Slots)
  { id: 21, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-001", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 22, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-002", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 23, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-003", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-106" },
  { id: 24, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-004", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-107" },
  { id: 25, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-005", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-108" },
  { id: 26, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-006", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-109" },
  { id: 27, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-007", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-110" },
  { id: 28, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-008", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-111" },
  { id: 29, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-009", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-112" },
  { id: 30, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-010", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-113" },
  { id: 31, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-011", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-114" },
  { id: 32, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-012", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-115" },
  { id: 33, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-013", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-116" },
  { id: 34, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-014", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 35, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-015", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 36, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-016", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 37, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-017", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-117" },
  { id: 38, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-018", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 39, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-019", vehicleTypeName: "Ô Tô", status: "LOCKED" },
  { id: 40, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-020", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
];

// ===========================================================================
// GATES
// ===========================================================================
export const MOCK_GATES = [
  { id: 1, code: "GATE-IN-01", name: "Cổng Vào Chính", type: "ENTRY", floorCode: "B1", status: "ACTIVE" },
  { id: 2, code: "GATE-OUT-01", name: "Cổng Ra Chính", type: "EXIT", floorCode: "B1", status: "ACTIVE" },
  { id: 3, code: "GATE-IN-02", name: "Cổng Vào Phụ", type: "ENTRY", floorCode: "B2", status: "ACTIVE" },
  { id: 4, code: "GATE-OUT-02", name: "Cổng Ra Phụ", type: "EXIT", floorCode: "B2", status: "INACTIVE" },
];

// ===========================================================================
// CARDS
// ===========================================================================
export const MOCK_CARDS = [
  { id: 1, code: "CARD-0001", status: "AVAILABLE", note: "", updatedAt: "2026-05-20T08:00:00Z", activeSession: null },
  { id: 2, code: "CARD-0002", status: "IN_USE", note: "", updatedAt: "2026-05-28T06:30:00Z", activeSession: { sessionCode: "SE-20260528-001", plate: "51A-12345" } },
  { id: 3, code: "CARD-0003", status: "AVAILABLE", note: "Thẻ mới nhập kho", updatedAt: "2026-05-15T10:00:00Z", activeSession: null },
  { id: 4, code: "CARD-0004", status: "LOST", note: "Mất tại cổng B1", updatedAt: "2026-05-10T14:00:00Z", activeSession: null },
  { id: 5, code: "CARD-0005", status: "DAMAGED", note: "Chip bị hỏng", updatedAt: "2026-04-20T09:00:00Z", activeSession: null },
  { id: 6, code: "CARD-0006", status: "AVAILABLE", note: "", updatedAt: "2026-05-18T11:00:00Z", activeSession: null },
  { id: 7, code: "CARD-0007", status: "IN_USE", note: "", updatedAt: "2026-05-28T07:15:00Z", activeSession: { sessionCode: "SE-20260528-002", plate: "59B-99999" } },
  { id: 8, code: "CARD-0008", status: "INACTIVE", note: "Ngừng sử dụng", updatedAt: "2026-03-01T00:00:00Z", activeSession: null },
];

// ===========================================================================
// USERS (Internal)
// ===========================================================================
export const MOCK_USERS = [
  { id: 1, username: "admin01", fullName: "Trần Quản Trị", email: "admin01@parking.vn", phone: "0901000001", role: "ADMIN", status: "ACTIVE" },
  { id: 2, username: "manager01", fullName: "Nguyễn Quản Lý", email: "manager01@parking.vn", phone: "0901000002", role: "MANAGER", status: "ACTIVE" },
  { id: 3, username: "staff01", fullName: "Lê Nhân Viên", email: "staff01@parking.vn", phone: "0901000003", role: "STAFF", status: "ACTIVE" },
  { id: 4, username: "staff02", fullName: "Phạm Thu Hà", email: "staff02@parking.vn", phone: "0901000004", role: "STAFF", status: "ACTIVE" },
  { id: 5, username: "staff03", fullName: "Vũ Hoàng Long", email: "staff03@parking.vn", phone: "0901000005", role: "STAFF", status: "LOCKED" },
  { id: 6, username: "manager02", fullName: "Đặng Thị Mai", email: "manager02@parking.vn", phone: "0901000006", role: "MANAGER", status: "INACTIVE" },
];

// ===========================================================================
// MONTHLY PASSES
// ===========================================================================
export const MOCK_MONTHLY_PASSES = [
  {
    id: 1,
    ownerName: "Nguyễn Văn An",
    phone: "0912345678",
    plate: "51A-12345",
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "ACTIVE",
  },
  {
    id: 2,
    ownerName: "Trần Thị Bình",
    phone: "0923456789",
    plate: "59B-99999",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "ACTIVE",
  },
  {
    id: 3,
    ownerName: "Lê Minh Châu",
    phone: "0934567890",
    plate: "51C-54321",
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "EXPIRED",
  },
  {
    id: 4,
    ownerName: "Phạm Đức Dũng",
    phone: "0945678901",
    plate: "51D-11111",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-05-15",
    endDate: "2026-06-14",
    status: "LOCKED",
  },
  {
    id: 5,
    ownerName: "Nguyễn Văn A",
    phone: "0912345678",
    plate: "51A-888.88",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    status: "ACTIVE",
  },
  {
    id: 6,
    ownerName: "Nguyễn Văn A",
    phone: "0912345678",
    plate: "59B-666.66",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "EXPIRED",
  },
  {
    id: 7,
    ownerName: "Nguyễn Văn A",
    phone: "0912345678",
    plate: "51C-777.77",
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    status: "ACTIVE",
  },
];

// ===========================================================================
// STATIC RULES
// ===========================================================================
export const STATIC_RULES = [
  {
    id: "entry",
    title: "Quy Định Vào Bãi",
    icon: "→",
    items: [
      "Xuất trình thẻ từ hoặc thẻ vé tháng tại cổng vào.",
      "Nhân viên sẽ ghi nhận biển số xe và phân slot đỗ.",
      "Xe không có biển số phải khai báo mô tả xe cụ thể.",
      "Không được vào bãi khi thẻ đang ở trạng thái LOST/DAMAGED.",
    ],
  },
  {
    id: "exit",
    title: "Quy Định Ra Bãi",
    icon: "←",
    items: [
      "Xuất trình thẻ và đọc biển số xe tại cổng ra.",
      "Thanh toán phí gửi xe trước khi hoàn tất lượt.",
      "Biển số xe ra phải khớp với biển số xe vào.",
      "Thời gian tính phí từ lúc xe vào đến lúc xe ra.",
    ],
  },
  {
    id: "lost-card",
    title: "Quy Định Mất Thẻ",
    icon: "⚠",
    items: [
      "Báo ngay với nhân viên tại quầy khi mất thẻ.",
      "Nhân viên tạo hồ sơ mất thẻ và thu thêm phí mất thẻ theo bảng giá.",
      "Hồ sơ mất thẻ cần được Quản Lý phê duyệt trước khi xe ra.",
      "Phí mất thẻ: Xe Máy 50.000đ | Ô Tô 100.000đ | Xe Đạp 30.000đ.",
    ],
  },
  {
    id: "mismatch",
    title: "Quy Định Sai Biển Số",
    icon: "🔄",
    items: [
      "Nếu biển số xe ra không khớp biển số vào, nhân viên tạo hồ sơ sai biển số.",
      "Quản Lý xem xét và phê duyệt hoặc từ chối.",
      "Khách hàng cần xuất trình giấy tờ xe để xác minh.",
      "Không được hoàn tất lượt gửi nếu hồ sơ chưa được phê duyệt.",
    ],
  },
  {
    id: "monthly",
    title: "Quy Định Vé Tháng",
    icon: "📅",
    items: [
      "Vé tháng được đăng ký theo biển số xe và loại xe cụ thể.",
      "Phải gia hạn trước ngày hết hạn để không bị gián đoạn.",
      "Vé tháng bị khóa không được dùng cho đến khi được kích hoạt lại.",
      "Chỉ 1 vé tháng ACTIVE cho mỗi biển số + loại xe cùng thời điểm.",
    ],
  },
  {
    id: "contact",
    title: "Liên Hệ Hỗ Trợ",
    icon: "📞",
    items: [
      "Hotline: 1800 1234 (miễn phí, 07:00 - 20:00)",
      "Email: support@parking.vn",
      "Quầy hỗ trợ: Tầng B1, cạnh cổng vào chính.",
      "Khiếu nại trực tiếp với Quản Lý bãi trong giờ làm việc.",
    ],
  },
];

// ===========================================================================
// MOTORBIKE OCCUPANCY DENSITY
// ===========================================================================
export const MOCK_MOTORBIKE_OCCUPANCY = {
  currentCount: 96,
  maxCapacity: 150,
  lastUpdated: "2026-06-03T08:00:00Z",
};

