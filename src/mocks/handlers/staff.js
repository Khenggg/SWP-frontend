import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, notFound, enabled } from "./helpers";
import { db } from "./db";
import { sessionDb } from "./sessionUtils";

const getSimTime = () => localStorage.getItem("driver_sim_time") || new Date().toISOString();
const ACTIVE_DEMO_BOOKING_ID = "BK-100001";
const EXPIRED_DEMO_BOOKING_ID = "BK-100099";

function createDemoBooking(bookingId = ACTIVE_DEMO_BOOKING_ID) {
  const now = new Date(getSimTime());
  const safeNow = Number.isNaN(now.getTime()) ? new Date() : now;
  const normalizedId = normalizeBookingId(bookingId);
  const isExpiredDemo = normalizedId === EXPIRED_DEMO_BOOKING_ID;
  const paidAt = isExpiredDemo
    ? new Date(safeNow.getTime() - 4 * 60 * 60 * 1000).toISOString()
    : safeNow.toISOString();
  return {
    id: bookingId,
    username: isExpiredDemo ? "driver-expired" : "driver02",
    areaCode: "B2-A",
    areaName: "Khu A - Tầng B2",
    floorCode: "B2",
    vehicleTypeName: "Ô Tô",
    hours: isExpiredDemo ? 1 : 3,
    reservationFee: isExpiredDemo ? 20000 : 60000,
    fee: isExpiredDemo ? 20000 : 60000,
    actualParkingFee: 0,
    actualHours: 0,
    status: "PAID",
    createdAt: paidAt,
    paidAt,
    checkInTime: null,
    checkOutTime: null,
    plate: null,
    internalSlotId: isExpiredDemo ? 209 : 201,
    internalSlotCode: isExpiredDemo ? "B2-A-019" : "B2-A-011",
  };
}

function normalizeBookingId(value) {
  return String(value || "").trim().replace(/^booking-/i, "").toUpperCase();
}

function normalizeCardCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizePlate(value) {
  return String(value || "").trim().toUpperCase();
}

function isCarType(vehicleTypeName) {
  return ["Ã” TÃ´", "O To", "Ô Tô"].includes(String(vehicleTypeName || "").trim());
}

function createPlateSvg(plate) {
  const safePlate = encodeURIComponent(plate || "-- --");
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f8fafc'/><rect x='40' y='50' width='240' height='80' rx='4' fill='white' stroke='%23cbd5e1' stroke-width='2'/><text x='50%' y='95' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='28' font-weight='bold' fill='%231e293b'>${safePlate}</text></svg>`;
}

function validateCardAvailable(cardCode) {
  const normalizedCard = normalizeCardCode(cardCode);
  const cards = db.getCards();
  const card = cards.find((item) => normalizeCardCode(item.code) === normalizedCard);

  if (!card) {
    throw new Error(`Tháº» ${normalizedCard} chÆ°a tá»“n táº¡i trong mock. HÃ£y dÃ¹ng CARD-0001, CARD-0003 hoáº·c CARD-0006.`);
  }
  if (card.status !== "AVAILABLE") {
    throw new Error(`Tháº» ${normalizedCard} Ä‘ang á»Ÿ tráº¡ng thÃ¡i ${card.status}, khÃ´ng thá»ƒ táº¡o phiÃªn vÃ o.`);
  }

  return { cards, card };
}

function getMonthlyPassForPlate(plate) {
  const normalizedPlate = normalizePlate(plate).replace(/[^A-Z0-9]/g, "");
  const today = new Date(getSimTime());
  const safeToday = Number.isNaN(today.getTime()) ? new Date() : today;
  return db.getMonthlyPasses().find((pass) => {
    const passPlate = normalizePlate(pass.plate).replace(/[^A-Z0-9]/g, "");
    if (pass.status !== "ACTIVE" || passPlate !== normalizedPlate) return false;
    const endDate = new Date(`${pass.endDate}T23:59:59`);
    return !Number.isNaN(endDate.getTime()) && safeToday <= endDate;
  });
}

function reserveSlot(vehicleTypeName, sessionCode, preferredSlotCode = "") {
  if (!isCarType(vehicleTypeName)) {
    return {
      floorCode: "B1",
      areaCode: "B1-A",
      slotCode: "B1-A / AUTO",
    };
  }

  const slots = db.getSlots();
  const preferred = preferredSlotCode
    ? slots.find((slot) => slot.code === preferredSlotCode && slot.status !== "LOCKED" && slot.status !== "MAINTENANCE")
    : null;
  const slot = preferred || slots.find((item) => isCarType(item.vehicleTypeName) && item.status === "AVAILABLE");

  if (!slot) {
    throw new Error("KhÃ´ng cÃ²n slot Ã´ tÃ´ AVAILABLE trong mock.");
  }

  slot.status = "OCCUPIED";
  slot.sessionCode = sessionCode;
  db.saveSlots(slots);

  return {
    floorCode: slot.floorCode,
    areaCode: slot.areaCode,
    slotCode: slot.code,
  };
}

function markCardInUse(cards, card, session) {
  card.status = "IN_USE";
  card.updatedAt = getSimTime();
  card.activeSession = {
    sessionCode: session.sessionCode,
    plate: session.plateNumber,
  };
  db.saveCards(cards);
}

function createEntrySession(form, options = {}) {
  const cardCode = normalizeCardCode(form.cardCode);
  const plate = normalizePlate(form.plate);
  const vehicleTypeName = form.vehicleTypeName || "Xe MÃ¡y";
  const { cards, card } = validateCardAvailable(cardCode);
  const sessions = sessionDb.getSessions();
  const sessionCode = `SE-${new Date(getSimTime()).toISOString().slice(0, 10).replace(/-/g, "")}-${String(sessions.length + 1).padStart(3, "0")}`;
  const monthlyPass = getMonthlyPassForPlate(plate);
  const slot = reserveSlot(vehicleTypeName, sessionCode, options.slotCode);
  const session = {
    id: Date.now(),
    sessionCode,
    plateNumber: plate,
    cardCode,
    qrToken: options.qrToken || `qr-${cardCode.toLowerCase()}`,
    vehicleTypeName,
    customerType: monthlyPass ? "MONTHLY" : options.customerType || "CASUAL",
    entryTime: getSimTime(),
    exitTime: null,
    floorCode: slot.floorCode,
    areaCode: slot.areaCode,
    slotCode: slot.slotCode,
    paymentStatus: monthlyPass || options.prepaid ? "PAID" : "UNPAID",
    status: "ACTIVE",
    entryGateCode: form.gateCode || "GATE-IN-01",
    exitGateCode: null,
    monthlyPassId: monthlyPass?.id || null,
    pricingSnapshot: {
      vehicleTypeName,
      dayPrice: isCarType(vehicleTypeName) ? 20000 : 5000,
      capturedAt: getSimTime(),
    },
    entryPlateImageDataUrl: form.plateImageDataUrl || createPlateSvg(plate),
    entryVehicleImageDataUrl: form.vehicleImageDataUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23475569'>Entry vehicle mock</text></svg>",
    entryDriverImageDataUrl: form.driverImageDataUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f1f5f9'/><circle cx='160' cy='80' r='30' fill='%2394a3b8'/><path d='M120 140c0-20 15-30 40-30s40 10 40 30' fill='%2394a3b8'/><text x='50%' y='160' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'>Entry driver mock</text></svg>",
  };

  sessions.push(session);
  sessionDb.saveSessions(sessions);
  markCardInUse(cards, card, session);
  sessionDb.addAuditLog("staff01", "PARKING_SESSION_ENTRY_CREATED", `Táº¡o phiÃªn ${session.sessionCode} cho xe ${session.plateNumber}`, "INFO", "STAFF");
  return session;
}

export const staffHandlers = [
  http.post(`${API_BASE_URLS.core}/staff/sessions/entry`, async ({ request }) => {
    await delay(200);
    try {
      const form = await request.json();
      if (!form.cardCode || !String(form.cardCode).trim()) {
        return badRequest("Thiáº¿u mÃ£ tháº» NFC Ä‘á»ƒ táº¡o phiÃªn vÃ o.");
      }
      if (!form.plate || !String(form.plate).trim()) {
        return badRequest("Thiáº¿u biá»ƒn sá»‘ xe Ä‘á»ƒ táº¡o phiÃªn vÃ o.");
      }

      const activeSessions = sessionDb.getSessions().filter((session) => session.status === "ACTIVE");
      const cardInActiveSession = activeSessions.some((session) => normalizeCardCode(session.cardCode) === normalizeCardCode(form.cardCode));
      if (cardInActiveSession) {
        return badRequest(`Tháº» ${normalizeCardCode(form.cardCode)} Ä‘ang cÃ³ phiÃªn active.`);
      }

      const session = createEntrySession(form);
      return ok({ session }, "Táº¡o phiÃªn xe vÃ o mock thÃ nh cÃ´ng.");
    } catch (error) {
      return badRequest(error.message || "KhÃ´ng thá»ƒ táº¡o phiÃªn xe vÃ o mock.");
    }
  }),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/staff/bookings/paid-list`, async () => {
      await delay(200);
      let inMemoryBookings = db.getBookings();
      const hasActiveDemoBooking = inMemoryBookings.some(b => normalizeBookingId(b.id) === ACTIVE_DEMO_BOOKING_ID);
      const hasExpiredDemoBooking = inMemoryBookings.some(b => normalizeBookingId(b.id) === EXPIRED_DEMO_BOOKING_ID);
      if (!hasActiveDemoBooking || !hasExpiredDemoBooking) {
        inMemoryBookings = [
          ...(!hasActiveDemoBooking ? [createDemoBooking(ACTIVE_DEMO_BOOKING_ID)] : []),
          ...(!hasExpiredDemoBooking ? [createDemoBooking(EXPIRED_DEMO_BOOKING_ID)] : []),
          ...inMemoryBookings,
        ];
        db.saveBookings(inMemoryBookings);
      }
      const paidList = inMemoryBookings.filter(b => b.status === "PAID");
      return ok(paidList);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/staff/bookings/:id`, async ({ params }) => {
      await delay(200);
      const requestedId = normalizeBookingId(params.id);
      if (!requestedId) {
        return badRequest("Thiếu mã booking để đối chiếu.");
      }

      let inMemoryBookings = db.getBookings();
      let booking = inMemoryBookings.find(b => normalizeBookingId(b.id) === requestedId);

      if (!booking && [ACTIVE_DEMO_BOOKING_ID, EXPIRED_DEMO_BOOKING_ID].includes(requestedId)) {
        booking = createDemoBooking(requestedId);
        inMemoryBookings = [booking, ...inMemoryBookings];
        db.saveBookings(inMemoryBookings);
      }

      if (!booking) {
        return notFound("Không tìm thấy booking theo mã QR.");
      }

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/staff/bookings/scan-confirm`, async ({ request }) => {
      await delay(200);
      const {
        bookingId,
        cardCode,
        plate,
        vehicleTypeName,
        gateCode,
        plateConfidence,
        plateImageDataUrl,
        vehicleImageDataUrl,
        driverImageDataUrl,
      } = await request.json();
      
      if (!cardCode || !cardCode.trim()) {
        return badRequest("Thiếu mã thẻ NFC để gán cho lượt đặt chỗ.");
      }
      if (!plate || !plate.trim()) {
        return badRequest("Thiếu biển số xe thực tế.");
      }

      let inMemoryBookings = db.getBookings();
      const index = inMemoryBookings.findIndex(b => b.id === bookingId);
      
      if (index === -1) {
        return notFound("Không tìm thấy mã đặt chỗ hoặc đặt chỗ đã được xử lý trước đó.");
      }
      
      const booking = inMemoryBookings[index];
      if (booking.status !== "PAID") {
        return badRequest("Mã đặt chỗ này chưa được thanh toán.");
      }

      try {
        const newSession = createEntrySession(
          {
            cardCode,
            plate,
            vehicleTypeName: vehicleTypeName || booking.vehicleTypeName,
            gateCode: gateCode || "GATE-IN-02",
            plateConfidence,
            plateImageDataUrl,
            vehicleImageDataUrl,
            driverImageDataUrl,
          },
          {
            prepaid: true,
            customerType: "BOOKING",
            qrToken: `booking-${bookingId}`,
            slotCode: booking.internalSlotCode,
          }
        );

        booking.status = "CHECKED_IN";
        booking.checkInTime = newSession.entryTime;
        booking.cardCode = newSession.cardCode;
        booking.plate = newSession.plateNumber;
        booking.sessionId = newSession.id;
        db.saveBookings(inMemoryBookings);

        return ok({ booking, session: newSession }, "XÃ¡c nháº­n xe vÃ o bÃ£i thÃ nh cÃ´ng!");
      } catch (error) {
        return badRequest(error.message || "KhÃ´ng thá»ƒ táº¡o phiÃªn booking mock.");
      }

      // Check if cardCode is already in use by another active session
      const sessions = sessionDb.getSessions();
      const isCardActive = sessions.some(s => s.status === "ACTIVE" && s.cardCode.toUpperCase() === cardCode.trim().toUpperCase());
      if (isCardActive) {
        return badRequest(`Thẻ ${cardCode.trim().toUpperCase()} đang được sử dụng ở một phiên đỗ xe khác.`);
      }
      
      // Create a new active session
      const newSession = {
        id: Date.now(),
        sessionCode: `SE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${sessions.length + 1}`,
        plateNumber: plate.trim().toUpperCase(),
        cardCode: cardCode.trim().toUpperCase(),
        qrToken: `booking-${bookingId}`,
        vehicleTypeName: vehicleTypeName || booking.vehicleTypeName || "Ô Tô",
        customerType: "CASUAL",
        entryTime: getSimTime(),
        exitTime: null,
        floorCode: "B2",
        areaCode: booking.areaCode || "B2-A",
        slotCode: booking.internalSlotCode || "B2-A-005",
        paymentStatus: "PAID", // bookings are prepaid
        status: "ACTIVE",
        entryGateCode: "GATE-IN-02",
        exitGateCode: null,
        entryPlateImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f8fafc'/><rect x='40' y='50' width='240' height='80' rx='4' fill='white' stroke='%23cbd5e1' stroke-width='2'/><text x='50%' y='95' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='28' font-weight='bold' fill='%231e293b'>" + plate.trim().toUpperCase() + "</text></svg>",
        entryVehicleImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23475569'>Ảnh xe booking lúc vào</text></svg>",
        entryDriverImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f1f5f9'/><circle cx='160' cy='80' r='30' fill='%2394a3b8'/><path d='M120 140c0-20 15-30 40-30s40 10 40 30' fill='%2394a3b8'/><text x='50%' y='160' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'>Tài xế xe booking</text></svg>"
      };

      sessions.push(newSession);
      sessionDb.saveSessions(sessions);
      
      // Update booking status to CHECKED_IN
      booking.status = "CHECKED_IN";
      booking.checkInTime = newSession.entryTime;
      booking.cardCode = newSession.cardCode;
      booking.plate = newSession.plateNumber;
      booking.sessionId = newSession.id;
      
      db.saveBookings(inMemoryBookings);
      
      return ok(booking, "Xác nhận xe vào bãi thành công!");
    })
  ),
];
