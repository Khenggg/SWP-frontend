import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, notFound, enabled } from "./helpers";
import { sessionDb } from "./sessionUtils";
import { db } from "./db";

function normalizePlate(value) {
  return String(value || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function isCarType(vehicleTypeName) {
  return ["Ã” TÃ´", "Ãƒâ€ TÃƒÂ´", "O To", "Ô Tô"].includes(String(vehicleTypeName || "").trim());
}

function releaseSessionResources(session) {
  const cards = db.getCards();
  const card = cards.find((item) => String(item.code || "").toUpperCase() === String(session.cardCode || "").toUpperCase());
  if (card) {
    card.status = "AVAILABLE";
    card.activeSession = null;
    card.updatedAt = new Date().toISOString();
    db.saveCards(cards);
  }

  if (session.slotCode && !session.slotCode.includes("AUTO")) {
    const slots = db.getSlots();
    const slot = slots.find((item) => item.code === session.slotCode);
    if (slot) {
      slot.status = "AVAILABLE";
      delete slot.sessionCode;
      db.saveSlots(slots);
    }
  }
}

function calculateFeePreview(session, exitTime = new Date().toISOString()) {
  const startedAt = new Date(session.entryTime).getTime();
  const endedAt = new Date(exitTime).getTime();
  const durationHours = Math.max(1, Math.ceil(Math.max(0, endedAt - startedAt) / (1000 * 60 * 60)));
  const isCar = session.vehicleTypeName === "Ô Tô" || session.vehicleTypeName === "Ã” TÃ´";
  const rate = (isCar || isCarType(session.vehicleTypeName)) ? 20000 : 5000;
  const totalAmount = session.paymentStatus === "PAID" ? 0 : durationHours * rate;

  return {
    rateLabel: `Bảng giá ${session.vehicleTypeName}`,
    durationHours,
    rate,
    totalAmount,
    paymentRequired: session.paymentStatus !== "PAID" && totalAmount > 0,
    waiveReason: session.paymentStatus === "PAID" ? "Đã thanh toán/miễn phí vé tháng" : "",
    exitTime,
  };
}

function getSessionOr404(sessionId) {
  return sessionDb.getSessions().find((session) => Number(session.id) === Number(sessionId));
}

function findPublicSession(qrToken) {
  const token = String(qrToken || "").trim();
  return sessionDb.getSessions().find((session) =>
    session.status === "ACTIVE" &&
    [session.cardCode, session.sessionCode, session.qrToken].filter(Boolean).includes(token)
  );
}

function publicLookupPayload(session) {
  return {
    session,
    feePreview: calculateFeePreview(session),
  };
}

export const adminHandlers = [
  http.get(`${API_BASE_URLS.core}/admin/sessions/active`, async () => {
    await delay(150);
    return ok(sessionDb.getSessions().filter((session) => session.status === "ACTIVE"));
  }),

  http.post(`${API_BASE_URLS.core}/admin/sessions/:sessionId/force-close`, async ({ params, request }) => {
    await delay(200);
    const { reason } = await request.json();
    const sessions = sessionDb.getSessions();
    const session = sessions.find((item) => Number(item.id) === Number(params.sessionId));
    if (!session) return notFound("Không tìm thấy phiên đỗ xe.");

    session.status = "COMPLETED";
    session.paymentStatus = "PAID";
    session.exitTime = new Date().toISOString();
    releaseSessionResources(session);
    sessionDb.saveSessions(sessions);
    sessionDb.addAuditLog("admin01", "FORCE_CLOSE_SESSION", `Đóng phiên ${session.sessionCode}. Lý do: ${reason}`, "CRITICAL", "ADMIN");
    return ok(session);
  }),

  http.post(`${API_BASE_URLS.core}/admin/sessions/:sessionId/cancel`, async ({ params, request }) => {
    await delay(200);
    const { reason } = await request.json();
    const sessions = sessionDb.getSessions();
    const session = sessions.find((item) => Number(item.id) === Number(params.sessionId));
    if (!session) return notFound("Không tìm thấy phiên đỗ xe.");

    session.status = "CANCELLED";
    session.paymentStatus = "CANCELLED";
    session.exitTime = new Date().toISOString();
    releaseSessionResources(session);
    sessionDb.saveSessions(sessions);
    sessionDb.addAuditLog("admin01", "CANCEL_SESSION", `Hủy phiên ${session.sessionCode}. Lý do: ${reason}`, "CRITICAL", "ADMIN");
    return ok(session);
  }),

  http.post(`${API_BASE_URLS.core}/admin/sessions/:sessionId/move-slot`, async ({ params, request }) => {
    await delay(200);
    const { reason, newSlotId } = await request.json();
    const sessions = sessionDb.getSessions();
    const session = sessions.find((item) => Number(item.id) === Number(params.sessionId));
    if (!session) return notFound("Không tìm thấy phiên đỗ xe.");

    const oldSlot = session.slotCode;
    session.slotCode = newSlotId;
    sessionDb.saveSessions(sessions);
    sessionDb.addAuditLog("admin01", "MOVE_SLOT", `Chuyển ${session.sessionCode} từ ${oldSlot} sang ${newSlotId}. Lý do: ${reason}`, "INFO", "ADMIN");
    return ok(session);
  }),

  http.get(`${API_BASE_URLS.core}/manager/approvals/lost-cards`, async () => {
    await delay(150);
    return ok(sessionDb.getLostCards());
  }),

  http.post(`${API_BASE_URLS.core}/manager/approvals/lost-cards/:caseId/decide`, async ({ params, request }) => {
    await delay(200);
    const { decision, reason } = await request.json();
    const cases = sessionDb.getLostCards();
    const item = cases.find((caseItem) => Number(caseItem.id) === Number(params.caseId));
    if (!item) return notFound("Không tìm thấy hồ sơ báo mất thẻ.");

    item.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
    item.decidedAt = new Date().toISOString();
    item.decidedBy = "manager01";
    item.decisionReason = reason;
    sessionDb.saveLostCards(cases);
    sessionDb.addAuditLog("manager01", `LOST_CARD_${decision}`, `Hồ sơ ${item.caseCode}. Lý do: ${reason}`, "WARNING", "MANAGER");
    return ok(item);
  }),

  http.get(`${API_BASE_URLS.core}/manager/approvals/mismatch`, async () => {
    await delay(150);
    return ok(sessionDb.getMismatch());
  }),

  http.post(`${API_BASE_URLS.core}/manager/approvals/mismatch/:caseId/decide`, async ({ params, request }) => {
    await delay(200);
    const { decision, reason } = await request.json();
    const cases = sessionDb.getMismatch();
    const item = cases.find((caseItem) => Number(caseItem.id) === Number(params.caseId));
    if (!item) return notFound("Không tìm thấy hồ sơ lệch biển số.");

    item.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
    item.decidedAt = new Date().toISOString();
    item.decidedBy = "manager01";
    item.decisionReason = reason;
    sessionDb.saveMismatch(cases);
    sessionDb.addAuditLog("manager01", `PLATE_MISMATCH_${decision}`, `Hồ sơ ${item.caseCode}. Lý do: ${reason}`, "WARNING", "MANAGER");
    return ok(item);
  }),

  http.get(`${API_BASE_URLS.core}/manager/audit-logs`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const query = (url.searchParams.get("query") || "").toLowerCase();
    const action = url.searchParams.get("action") || "";
    const source = url.searchParams.get("source") || "";
    let logs = sessionDb.getAuditLogs();

    if (query) {
      logs = logs.filter((log) =>
        log.actor.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.detail.toLowerCase().includes(query)
      );
    }
    if (action) logs = logs.filter((log) => log.action === action);
    if (source) logs = logs.filter((log) => log.source === source);

    return ok(logs);
  }),

  http.get(`${API_BASE_URLS.public}/public/lookup/:qrToken`, async ({ params }) => {
    await delay(150);
    const session = findPublicSession(params.qrToken);
    if (!session) return notFound("Không tìm thấy vé đỗ xe đang hoạt động với mã cung cấp.");
    return ok(publicLookupPayload(session));
  }),

  http.get(`${API_BASE_URLS.public}/lookup/:qrToken`, async ({ params }) => {
    await delay(150);
    const session = findPublicSession(params.qrToken);
    if (!session) return notFound("Không tìm thấy vé đỗ xe đang hoạt động với mã cung cấp.");
    return ok(publicLookupPayload(session));
  }),

  http.get(`${API_BASE_URLS.core}/staff/sessions/active`, async () => {
    await delay(150);
    return ok(sessionDb.getSessions().filter((session) => session.status === "ACTIVE"));
  }),

  http.get(`${API_BASE_URLS.core}/staff/sessions/search`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const cardCode = (url.searchParams.get("cardCode") || "").trim().toUpperCase();
    const plate = normalizePlate(url.searchParams.get("plate") || "");
    const session = sessionDb.getSessions().find((item) => {
      if (item.status !== "ACTIVE") return false;
      const byCard = cardCode && item.cardCode.toUpperCase() === cardCode;
      const byPlate = plate && normalizePlate(item.plateNumber).includes(plate);
      return byCard || byPlate;
    });

    if (!session) return notFound("Không tìm thấy phiên đỗ xe hoạt động khớp với yêu cầu.");
    return ok(session);
  }),

  http.post(`${API_BASE_URLS.core}/staff/sessions/:sessionId/preview-fee`, async ({ params, request }) => {
    await delay(150);
    const { exitTime } = await request.json();
    const session = getSessionOr404(params.sessionId);
    if (!session) return notFound("Không tìm thấy phiên.");
    return ok(calculateFeePreview(session, exitTime || new Date().toISOString()));
  }),

  http.post(`${API_BASE_URLS.core}/staff/sessions/:sessionId/pay-cash`, async ({ params, request }) => {
    await delay(150);
    const { receivedAmount } = await request.json();
    const sessions = sessionDb.getSessions();
    const session = sessions.find((item) => Number(item.id) === Number(params.sessionId));
    if (!session) return notFound("Không tìm thấy phiên.");

    session.paymentStatus = "PAID";
    sessionDb.saveSessions(sessions);
    sessionDb.addAuditLog("staff01", "CASH_PAYMENT_COLLECTED", `Nhận ${receivedAmount}đ cho phiên ${session.sessionCode}`, "INFO", "STAFF");
    return ok(session);
  }),

  http.post(`${API_BASE_URLS.core}/staff/sessions/:sessionId/mismatch-case`, async ({ params, request }) => {
    await delay(150);
    const { exitPlateNumber, reason } = await request.json();
    const session = getSessionOr404(params.sessionId);
    if (!session) return notFound("Không tìm thấy phiên.");

    const mismatchList = sessionDb.getMismatch();
    const newCase = {
      id: Date.now(),
      caseCode: `MM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${mismatchList.length + 1}`,
      sessionId: session.id,
      sessionCode: session.sessionCode,
      entryPlateNumber: session.plateNumber,
      exitPlateNumber,
      cardCode: session.cardCode,
      vehicleTypeName: session.vehicleTypeName,
      createdAt: new Date().toISOString(),
      reason,
      status: "PENDING",
    };

    mismatchList.unshift(newCase);
    sessionDb.saveMismatch(mismatchList);
    sessionDb.addAuditLog("staff01", "PLATE_MISMATCH_CASE_CREATED", `Tạo hồ sơ ${newCase.caseCode}`, "WARNING", "STAFF");
    return ok(newCase);
  }),

  http.post(`${API_BASE_URLS.core}/staff/sessions/:sessionId/complete-exit`, async ({ params, request }) => {
    await delay(200);
    const { exitTime, exitGateCode } = await request.json();
    const sessions = sessionDb.getSessions();
    const session = sessions.find((item) => Number(item.id) === Number(params.sessionId));
    if (!session) return notFound("Không tìm thấy phiên.");

    const activeMismatch = sessionDb.getMismatch().find((item) => item.sessionId === session.id && item.status === "PENDING");
    if (activeMismatch) {
      return badRequest("Không thể hoàn tất exit: đang có hồ sơ lệch biển số chưa được Manager xử lý.");
    }

    const feePreview = calculateFeePreview(session, exitTime || new Date().toISOString());
    session.status = "COMPLETED";
    session.exitTime = feePreview.exitTime;
    session.exitGateCode = exitGateCode || "GATE-OUT-01";
    session.paymentStatus = "PAID";
    releaseSessionResources(session);
    sessionDb.saveSessions(sessions);
    sessionDb.addAuditLog("staff01", "PARKING_SESSION_EXIT_COMPLETED", `Hoàn tất lượt gửi ${session.sessionCode}`, "INFO", "STAFF");

    // Complete linked booking if any
    if (session.qrToken && session.qrToken.startsWith("booking-")) {
      const bookingId = session.qrToken.split("booking-")[1];
      let inMemoryBookings = db.getBookings();
      const bookingIndex = inMemoryBookings.findIndex(b => b.id === bookingId);
      if (bookingIndex !== -1) {
        const booking = inMemoryBookings[bookingIndex];
        booking.status = "COMPLETED";
        booking.checkOutTime = session.exitTime;
        const getMinutesDiff = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / 60000);
        const durationMins = getMinutesDiff(booking.checkInTime, booking.checkOutTime);
        booking.actualHours = Math.max(1, Math.ceil(durationMins / 60));
        booking.actualParkingFee = booking.reservationFee;

        // Move to history of that driver
        const username = booking.username || "driver01";
        let inMemoryHistory = db.getHistory();
        if (!inMemoryHistory[username]) {
          inMemoryHistory[username] = [];
        }
        inMemoryHistory[username].unshift({ ...booking });
        db.saveHistory(inMemoryHistory);

        // Remove from active bookings
        inMemoryBookings = inMemoryBookings.filter(b => b.id !== bookingId);
        db.saveBookings(inMemoryBookings);
      }
    }

    return ok({
      session,
      receipt: {
        receiptCode: `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`,
        plateNumber: session.plateNumber,
        cardCode: session.cardCode,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        totalAmount: feePreview.totalAmount,
      },
    });
  }),

  http.post(`${API_BASE_URLS.core}/staff/sessions/:sessionId/lost-card`, async ({ params, request }) => {
    await delay(200);
    const form = await request.json();
    const session = getSessionOr404(params.sessionId);
    if (!session) return notFound("Không tìm thấy phiên đỗ xe.");

    const lostCardList = sessionDb.getLostCards();
    const newCase = {
      id: Date.now(),
      caseCode: `LC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${lostCardList.length + 1}`,
      sessionId: session.id,
      sessionCode: session.sessionCode,
      plateNumber: session.plateNumber,
      cardCode: session.cardCode,
      reporterName: form.reporterName,
      phone: form.phone,
      verificationNote: form.verificationNote,
      reason: form.reason,
      lostCardFee: session.vehicleTypeName === "Ô Tô" ? 100000 : 50000,
      createdAt: new Date().toISOString(),
      status: "PENDING",
    };

    lostCardList.unshift(newCase);
    sessionDb.saveLostCards(lostCardList);
    sessionDb.addAuditLog("staff01", "LOST_CARD_CASE_CREATED", `Tạo hồ sơ mất thẻ ${newCase.caseCode}`, "WARNING", "STAFF");
    return ok(newCase);
  }),

  http.get(`${API_BASE_URLS.core}/manager/reports/summary`, async () => {
    await delay(150);
    return ok({
      revenueToday: 3980000,
      revenueDelta: 8,
      entriesToday: 187,
      exitsToday: 172,
      activeSessions: sessionDb.getSessions().filter((session) => session.status === "ACTIVE").length,
      occupancyRate: 68,
    });
  }),

  http.get(`${API_BASE_URLS.core}/manager/reports/revenue`, async () => {
    await delay(150);
    return ok([
      { label: "10/06", revenue: 3250000 },
      { label: "11/06", revenue: 4180000 },
      { label: "12/06", revenue: 3820000 },
      { label: "13/06", revenue: 4510000 },
      { label: "14/06", revenue: 5120000 },
      { label: "15/06", revenue: 4760000 },
      { label: "16/06", revenue: 3980000 },
    ]);
  }),

  http.get(`${API_BASE_URLS.core}/manager/reports/traffic`, async () => {
    await delay(150);
    return ok([
      { label: "06:00", entry: 18, exit: 6 },
      { label: "09:00", entry: 42, exit: 15 },
      { label: "12:00", entry: 28, exit: 33 },
      { label: "15:00", entry: 36, exit: 24 },
      { label: "18:00", entry: 51, exit: 58 },
      { label: "21:00", entry: 12, exit: 31 },
    ]);
  }),

  http.get(`${API_BASE_URLS.core}/manager/reports/occupancy`, async () => {
    await delay(150);
    return ok([
      { label: "B1-A", occupancy: 72 },
      { label: "B1-B", occupancy: 62 },
      { label: "B2-A", occupancy: 65 },
      { label: "B2-B", occupancy: 82 },
      { label: "B3-A", occupancy: 41 },
      { label: "B3-B", occupancy: 58 },
    ]);
  }),

  // =========================================================================
  // ADMIN USER MANAGEMENT
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.ADMIN_USERS,
    http.get(`${API_BASE_URLS.core}/admin/users`, async () => {
      await delay(200);
      return ok(db.getUsers());
    })
  ),

  ...enabled(
    MOCK_FLAGS.ADMIN_USERS,
    http.post(`${API_BASE_URLS.core}/admin/users`, async ({ request }) => {
      await delay(250);
      const data = await request.json();
      let users = db.getUsers();
      if (users.some(u => u.username.trim().toLowerCase() === data.username.trim().toLowerCase())) {
        return badRequest("Tên đăng nhập này đã tồn tại!");
      }
      const newUser = {
        id: Date.now(),
        username: data.username.trim(),
        fullName: data.fullName.trim(),
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "STAFF",
        status: "ACTIVE",
      };
      users.push(newUser);
      db.saveUsers(users);
      return ok(newUser);
    })
  ),

  ...enabled(
    MOCK_FLAGS.ADMIN_USERS,
    http.put(`${API_BASE_URLS.core}/admin/users/:id`, async ({ params, request }) => {
      await delay(250);
      const userId = Number(params.id);
      const data = await request.json();
      let users = db.getUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) return notFound("Không tìm thấy người dùng.");

      users[index] = {
        ...users[index],
        fullName: data.fullName.trim(),
        email: data.email || "",
        phone: data.phone || "",
      };
      db.saveUsers(users);
      return ok(users[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.ADMIN_USERS,
    http.put(`${API_BASE_URLS.core}/admin/users/:id/role`, async ({ params, request }) => {
      await delay(250);
      const userId = Number(params.id);
      const { role } = await request.json();
      let users = db.getUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) return notFound("Không tìm thấy người dùng.");

      users[index].role = role;
      db.saveUsers(users);
      return ok(users[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.ADMIN_USERS,
    http.put(`${API_BASE_URLS.core}/admin/users/:id/status`, async ({ params, request }) => {
      await delay(250);
      const userId = Number(params.id);
      const { status } = await request.json();
      let users = db.getUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) return notFound("Không tìm thấy người dùng.");

      users[index].status = status;
      db.saveUsers(users);
      return ok(users[index]);
    })
  ),
];
