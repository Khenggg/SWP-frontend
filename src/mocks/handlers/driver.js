import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { MOCK_VEHICLE_TYPES } from "../mockData";
import { ok, badRequest, notFound, enabled, getUsernameFromHeader } from "./helpers";
import { db } from "./db";
import { sessionDb } from "./sessionUtils";

// Help helpers for density update
const incrementAreaOccupancy = (areaCode) => {
  const inMemoryAreas = db.getAreas();
  const inMemoryParkingInfo = db.getParkingInfo();

  const index = inMemoryAreas.findIndex(a => a.code === areaCode);
  if (index !== -1) {
    const area = inMemoryAreas[index];
    if (area.currentCount !== undefined && area.maxCapacity) {
      area.currentCount = Math.min(area.maxCapacity, area.currentCount + 1);
    }
    if (area.availableSlots !== undefined) {
      area.availableSlots = Math.max(0, area.availableSlots - 1);
    }
    inMemoryParkingInfo.availableSlots = Math.max(0, inMemoryParkingInfo.availableSlots - 1);
    
    db.saveAreas(inMemoryAreas);
    db.saveParkingInfo(inMemoryParkingInfo);
  }
};

const decrementAreaOccupancy = (areaCode) => {
  const inMemoryAreas = db.getAreas();
  const inMemoryParkingInfo = db.getParkingInfo();

  const index = inMemoryAreas.findIndex(a => a.code === areaCode);
  if (index !== -1) {
    const area = inMemoryAreas[index];
    if (area.currentCount !== undefined && area.currentCount > 0) {
      area.currentCount = area.currentCount - 1;
    }
    if (area.availableSlots !== undefined && area.totalSlots) {
      area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
    }
    inMemoryParkingInfo.availableSlots = Math.min(inMemoryParkingInfo.totalSlots || 40, inMemoryParkingInfo.availableSlots + 1);
    
    db.saveAreas(inMemoryAreas);
    db.saveParkingInfo(inMemoryParkingInfo);
  }
};

export const driverHandlers = [
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/driver/vehicles`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      
      let fullName = "Nguyễn Văn A";
      let phone = "0912345678";
      if (username === "driver02") {
        fullName = "Trần Văn B";
        phone = "0987654321";
      }

      const inMemoryPasses = db.getMonthlyPasses();
      const vehicles = inMemoryPasses.filter(
        (pass) => pass.ownerName === fullName || pass.phone === phone
      );
      return ok(vehicles);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/driver/bookings`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const inMemoryBookings = db.getBookings();
      const active = inMemoryBookings.find(b => b.username === username);
      return ok(active || null);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { areaCode, durationHours, simTime } = await request.json();

      let inMemoryBookings = db.getBookings();
      // Check if already has active booking
      if (inMemoryBookings.some(b => b.username === username)) {
        return badRequest("Bạn đã có một phiên đặt chỗ hoặc phiên đỗ đang hoạt động!");
      }

      const inMemoryAreas = db.getAreas();
      const area = inMemoryAreas.find(a => a.code === areaCode);
      if (!area || area.status !== "ACTIVE") {
        return badRequest("Khu vực đỗ xe không khả dụng.");
      }

      // Check capacity
      const maxCap = area.maxCapacity || area.totalSlots || 0;
      const current = area.currentCount !== undefined ? area.currentCount : (maxCap - (area.availableSlots || 0));
      if (current >= maxCap) {
        return badRequest("Khu vực này đã hết chỗ trống!");
      }

      const inMemoryPricingRules = db.getPricingRules();
      const price = inMemoryPricingRules.find(r => r.vehicleTypeName === area.vehicleTypeName && r.status === "ACTIVE")?.dayPrice || 20000;
      const fee = durationHours * price;

      const allocatedSlotId = Math.floor(100 + Math.random() * 900);
      const allocatedSlotCode = `${area.code}-0${Math.floor(10 + Math.random() * 89)}`;

      const newBooking = {
        id: "BK-" + Math.floor(100000 + Math.random() * 900000),
        username,
        areaCode: area.code,
        areaName: area.name,
        floorCode: area.floorCode,
        vehicleTypeName: area.vehicleTypeName,
        hours: durationHours,
        reservationFee: fee,
        fee,
        actualParkingFee: 0,
        actualHours: 0,
        status: "PENDING_PAYMENT",
        createdAt: simTime || new Date().toISOString(),
        paidAt: null,
        checkInTime: null,
        checkOutTime: null,
        plate: null,
        internalSlotId: allocatedSlotId,
        internalSlotCode: allocatedSlotCode
      };

      inMemoryBookings.push(newBooking);
      db.saveBookings(inMemoryBookings);
      return ok(newBooking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/pay`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { simTime } = await request.json();

      let inMemoryBookings = db.getBookings();
      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = "PAID";
      booking.paidAt = simTime || new Date().toISOString();

      db.saveBookings(inMemoryBookings);
      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/cancel`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { simTime } = await request.json();

      let inMemoryBookings = db.getBookings();
      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = "CANCELLED";
      booking.checkOutTime = simTime || new Date().toISOString();

      // Move to history
      let inMemoryHistory = db.getHistory();
      if (!inMemoryHistory[username]) inMemoryHistory[username] = [];
      inMemoryHistory[username].unshift(booking);
      db.saveHistory(inMemoryHistory);

      // Remove from active
      inMemoryBookings = inMemoryBookings.filter(b => b.username !== username);
      db.saveBookings(inMemoryBookings);

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/check-in`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { plate, simTime } = await request.json();

      let inMemoryBookings = db.getBookings();
      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = "CHECKED_IN";
      booking.plate = plate;
      booking.checkInTime = simTime || new Date().toISOString();

      // Occupy slot in bãi
      incrementAreaOccupancy(booking.areaCode);

      // Create an active session in sessionDb to keep it in sync
      const sessions = sessionDb.getSessions();
      const cardCode = `CARD-BK-${booking.id.split("-")[1] || "0000"}`;
      
      // Remove any existing active session for this card to prevent duplicate active cards
      const filteredSessions = sessions.filter(s => !(s.status === "ACTIVE" && s.cardCode === cardCode));
      
      const newSession = {
        id: Date.now(),
        sessionCode: `SE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${filteredSessions.length + 1}`,
        plateNumber: plate.trim().toUpperCase(),
        cardCode: cardCode,
        qrToken: `booking-${booking.id}`,
        vehicleTypeName: booking.vehicleTypeName || "Ô Tô",
        customerType: "CASUAL",
        entryTime: booking.checkInTime,
        exitTime: null,
        floorCode: "B2",
        areaCode: booking.areaCode || "B2-A",
        slotCode: booking.internalSlotCode || "B2-A-005",
        paymentStatus: "PAID",
        status: "ACTIVE",
        entryGateCode: "GATE-IN-02",
        exitGateCode: null,
        entryPlateImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f8fafc'/><rect x='40' y='50' width='240' height='80' rx='4' fill='white' stroke='%23cbd5e1' stroke-width='2'/><text x='50%' y='95' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='28' font-weight='bold' fill='%231e293b'>" + plate.trim().toUpperCase() + "</text></svg>",
        entryVehicleImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23475569'>Ảnh xe booking lúc vào</text></svg>",
        entryDriverImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f1f5f9'/><circle cx='160' cy='80' r='30' fill='%2394a3b8'/><path d='M120 140c0-20 15-30 40-30s40 10 40 30' fill='%2394a3b8'/><text x='50%' y='160' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'>Tài xế xe booking</text></svg>"
      };

      filteredSessions.push(newSession);
      sessionDb.saveSessions(filteredSessions);

      db.saveBookings(inMemoryBookings);
      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/check-out`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { simTime } = await request.json();

      let inMemoryBookings = db.getBookings();
      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      
      // Calculate actual parking fee
      const getMinutesDiff = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / 60000);
      const durationMins = getMinutesDiff(booking.checkInTime, simTime || new Date().toISOString());
      const actualHours = Math.max(1, Math.ceil(durationMins / 60));
      const inMemoryPricingRules = db.getPricingRules();
      const price = inMemoryPricingRules.find(r => r.vehicleTypeName === booking.vehicleTypeName && r.status === "ACTIVE")?.dayPrice || 20000;
      const actualParkingFee = actualHours * price;

      booking.status = "COMPLETED";
      booking.checkOutTime = simTime || new Date().toISOString();
      booking.actualHours = actualHours;
      booking.actualParkingFee = actualParkingFee;

      // Free slot in bãi
      decrementAreaOccupancy(booking.areaCode);

      // Complete active session in sessionDb
      const sessions = sessionDb.getSessions();
      const sessionIndex = sessions.findIndex(s => s.status === "ACTIVE" && s.qrToken === `booking-${booking.id}`);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].status = "COMPLETED";
        sessions[sessionIndex].exitTime = booking.checkOutTime;
        sessions[sessionIndex].exitGateCode = "GATE-OUT-02";
        sessions[sessionIndex].paymentStatus = "PAID";
        sessionDb.saveSessions(sessions);
      }

      // Move to history
      let inMemoryHistory = db.getHistory();
      if (!inMemoryHistory[username]) inMemoryHistory[username] = [];
      inMemoryHistory[username].unshift(booking);
      db.saveHistory(inMemoryHistory);

      // Remove from active
      inMemoryBookings = inMemoryBookings.filter(b => b.username !== username);
      db.saveBookings(inMemoryBookings);

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/expire`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { status } = await request.json(); // EXPIRED_TIMEOUT or EXPIRED_CHECKIN

      let inMemoryBookings = db.getBookings();
      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = status;

      // Move to history
      let inMemoryHistory = db.getHistory();
      if (!inMemoryHistory[username]) inMemoryHistory[username] = [];
      inMemoryHistory[username].unshift(booking);
      db.saveHistory(inMemoryHistory);

      // Remove from active
      inMemoryBookings = inMemoryBookings.filter(b => b.username !== username);
      db.saveBookings(inMemoryBookings);

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_HISTORY,
    http.get(`${API_BASE_URLS.core}/driver/bookings/history`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const inMemoryHistory = db.getHistory();
      return ok(inMemoryHistory[username] || []);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_HISTORY,
    http.delete(`${API_BASE_URLS.core}/driver/bookings/history`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      let inMemoryHistory = db.getHistory();
      inMemoryHistory[username] = [];
      db.saveHistory(inMemoryHistory);
      return ok([], "Lịch sử đã được xóa thành công.");
    })
  ),
];
