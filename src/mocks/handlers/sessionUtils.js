import { getMockData, saveMockData } from "../mockStorage";

const INITIAL_SESSIONS = [
  {
    id: 1001,
    sessionCode: "SE-20260616-001",
    plateNumber: "51A-12345",
    cardCode: "CARD-0002",
    qrToken: "qr-card-0002",
    vehicleTypeName: "Ô Tô",
    customerType: "CASUAL",
    entryTime: "2026-06-16T01:30:00.000Z",
    exitTime: null,
    floorCode: "B2",
    areaCode: "B2-A",
    slotCode: "B2-A-003",
    paymentStatus: "UNPAID",
    status: "ACTIVE",
    entryGateCode: "GATE-IN-02",
    exitGateCode: null,
    entryPlateImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f8fafc'/><rect x='40' y='50' width='240' height='80' rx='4' fill='white' stroke='%23cbd5e1' stroke-width='2'/><text x='50%' y='95' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='28' font-weight='bold' fill='%231e293b'>51A-123.45</text></svg>",
    entryVehicleImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23475569'>Ảnh xe lúc vào (Ô tô xanh)</text></svg>",
    entryDriverImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f1f5f9'/><circle cx='160' cy='80' r='30' fill='%2394a3b8'/><path d='M120 140c0-20 15-30 40-30s40 10 40 30' fill='%2394a3b8'/><text x='50%' y='160' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'>Tài xế 51A-12345</text></svg>"
  },
  {
    id: 1002,
    sessionCode: "SE-20260616-002",
    plateNumber: "59B-99999",
    cardCode: "CARD-0007",
    qrToken: "qr-card-0007",
    vehicleTypeName: "Ô Tô",
    customerType: "MONTHLY",
    entryTime: "2026-06-16T00:15:00.000Z",
    exitTime: null,
    floorCode: "B2",
    areaCode: "B2-B",
    slotCode: "B2-B-004",
    paymentStatus: "PAID",
    status: "ACTIVE",
    entryGateCode: "GATE-IN-02",
    exitGateCode: null,
    entryPlateImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f8fafc'/><rect x='40' y='50' width='240' height='80' rx='4' fill='white' stroke='%23cbd5e1' stroke-width='2'/><text x='50%' y='95' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='28' font-weight='bold' fill='%231e293b'>59B-999.99</text></svg>",
    entryVehicleImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23475569'>Ảnh xe lúc vào (Ô tô trắng)</text></svg>",
    entryDriverImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f1f5f9'/><circle cx='160' cy='80' r='30' fill='%2394a3b8'/><path d='M120 140c0-20 15-30 40-30s40 10 40 30' fill='%2394a3b8'/><text x='50%' y='160' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'>Tài xế 59B-99999</text></svg>"
  },
  {
    id: 1003,
    sessionCode: "SE-20260616-003",
    plateNumber: "51C-77888",
    cardCode: "CARD-0099",
    qrToken: "qr-card-0099",
    vehicleTypeName: "Xe Máy",
    customerType: "CASUAL",
    entryTime: "2026-06-15T23:10:00.000Z",
    exitTime: null,
    floorCode: "B1",
    areaCode: "B1-A",
    slotCode: "B1-A",
    paymentStatus: "UNPAID",
    status: "ACTIVE",
    entryGateCode: "GATE-IN-01",
    exitGateCode: null,
    entryPlateImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f8fafc'/><rect x='40' y='50' width='240' height='80' rx='4' fill='white' stroke='%23cbd5e1' stroke-width='2'/><text x='50%' y='95' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='28' font-weight='bold' fill='%231e293b'>51C-778.88</text></svg>",
    entryVehicleImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23475569'>Ảnh xe lúc vào (Xe máy đen)</text></svg>",
    entryDriverImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f1f5f9'/><circle cx='160' cy='80' r='30' fill='%2394a3b8'/><path d='M120 140c0-20 15-30 40-30s40 10 40 30' fill='%2394a3b8'/><text x='50%' y='160' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'>Tài xế 51C-77888</text></svg>"
  }
];

const INITIAL_MISMATCH = [
  {
    id: 701,
    caseCode: "MM-20260616-001",
    sessionId: 1001,
    sessionCode: "SE-20260616-001",
    entryPlateNumber: "51A-12345",
    exitPlateNumber: "51A-123.46",
    cardCode: "CARD-0002",
    vehicleTypeName: "Ô Tô",
    createdAt: "2026-06-16T03:35:00.000Z",
    reason: "OCR cổng ra đọc lệch ký tự cuối, cần quản lý xác nhận.",
    status: "PENDING",
  },
];

const INITIAL_LOST_CARDS = [
  {
    id: 501,
    caseCode: "LC-20260616-001",
    sessionId: 1003,
    sessionCode: "SE-20260616-003",
    plateNumber: "51C-77888",
    cardCode: "CARD-0099",
    reporterName: "Nguyễn Minh Khang",
    phone: "0909123456",
    lostCardFee: 50000,
    createdAt: "2026-06-16T03:20:00.000Z",
    verificationNote: "Khách xuất trình CCCD và giấy đăng ký xe.",
    reason: "Làm rơi thẻ trong khu thương mại.",
    status: "PENDING",
  },
];

const INITIAL_AUDITS = [
  {
    id: 9001,
    timestamp: "2026-06-15T08:15:00.000Z",
    actor: "manager01",
    action: "PRICE_RULE_UPDATED",
    detail: "Cập nhật giá ô tô theo khung Sprint demo.",
    severity: "INFO",
    source: "MANAGER",
    ipAddress: "192.168.1.10",
  },
  {
    id: 9002,
    timestamp: "2026-06-16T03:20:00.000Z",
    actor: "staff01",
    action: "LOST_CARD_CASE_CREATED",
    detail: "Tạo hồ sơ mất thẻ LC-20260616-001 cho xe 51C-77888",
    severity: "WARNING",
    source: "STAFF",
    ipAddress: "192.168.1.15",
  },
  {
    id: 9003,
    timestamp: "2026-06-16T04:00:00.000Z",
    actor: "admin01",
    action: "USER_STATUS_CHANGED",
    detail: "Khóa tài khoản staff nghỉ ca.",
    severity: "SECURITY",
    source: "ADMIN",
    ipAddress: "192.168.1.20",
  },
];

function getSeededSessions() {
  const sessions = getMockData("sessions", INITIAL_SESSIONS);
  const hasRestoredSeed =
    Array.isArray(sessions) &&
    sessions.some((session) => session.cardCode === "CARD-0002" && session.qrToken === "qr-card-0002");

  if (!hasRestoredSeed) {
    saveMockData("sessions", INITIAL_SESSIONS);
    return INITIAL_SESSIONS;
  }

  return sessions;
}

export const sessionDb = {
  getSessions: getSeededSessions,
  saveSessions: (data) => saveMockData("sessions", data),

  getMismatch: () => getMockData("mismatch", INITIAL_MISMATCH),
  saveMismatch: (data) => saveMockData("mismatch", data),

  getLostCards: () => getMockData("lost_cards", INITIAL_LOST_CARDS),
  saveLostCards: (data) => saveMockData("lost_cards", data),

  getAuditLogs: () => getMockData("audits", INITIAL_AUDITS),
  saveAuditLogs: (data) => saveMockData("audits", data),

  addAuditLog: (actor, action, detail, severity = "INFO", source = "SYSTEM", ipAddress = "127.0.0.1") => {
    const logs = sessionDb.getAuditLogs();
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      actor,
      action,
      detail,
      severity,
      source,
      ipAddress,
    };
    logs.unshift(newLog);
    sessionDb.saveAuditLogs(logs);
    return newLog;
  },
};
