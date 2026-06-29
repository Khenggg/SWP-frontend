import coreAxiosClient from "../api/coreAxiosClient";

export const bookingService = {
  getActiveBooking: async () => {
    const res = await coreAxiosClient.get("/driver/bookings");
    return res.success ? res.data : null;
  },

  createBooking: async (areaCode, durationHours, simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings", { areaCode, durationHours, simTime });
    if (res.success) return res.data;
    throw new Error(res.message || "Đặt chỗ thất bại");
  },

  payBooking: async (simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/pay", { simTime });
    if (res.success) return res.data;
    throw new Error(res.message || "Thanh toán thất bại");
  },

  checkIn: async (plate, simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/check-in", { plate, simTime });
    if (res.success) return res.data;
    throw new Error(res.message || "Check-in thất bại");
  },

  checkOut: async (simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/check-out", { simTime });
    if (res.success) return res.data;
    throw new Error(res.message || "Check-out thất bại");
  },

  cancelBooking: async (simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/cancel", { simTime });
    if (res.success) return res.data;
    throw new Error(res.message || "Hủy đặt chỗ thất bại");
  },

  expireBooking: async (status) => {
    const res = await coreAxiosClient.post("/driver/bookings/expire", { status });
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật hết hạn đặt chỗ thất bại");
  },

  getHistory: async () => {
    const res = await coreAxiosClient.get("/driver/bookings/history");
    return res.success ? res.data : [];
  },

  clearHistory: async () => {
    const res = await coreAxiosClient.delete("/driver/bookings/history");
    if (res.success) return res.data;
    throw new Error(res.message || "Xóa lịch sử thất bại");
  },

  getPaidBookingsForStaff: async () => {
    const res = await coreAxiosClient.get("/staff/bookings/paid-list");
    return res.success ? res.data : [];
  },

  getBookingForStaff: async (bookingId) => {
    const res = await coreAxiosClient.get(`/staff/bookings/${encodeURIComponent(bookingId)}`);
    if (res.success) return res.data;
    throw new Error(res.message || "Không tìm thấy booking.");
  },

  createCasualEntry: async (entryData = {}) => {
    const res = await coreAxiosClient.post("/staff/sessions/entry", entryData);
    if (res.success) return res.data;
    throw new Error(res.message || "Táº¡o phiÃªn xe vÃ o vÃ£ng lai tháº¥t báº¡i");
  },

  confirmBookingScan: async (bookingId, entryData = {}) => {
    const res = await coreAxiosClient.post("/staff/bookings/scan-confirm", { bookingId, ...entryData });
    if (res.success) return res.data;
    throw new Error(res.message || "Xác nhận quét mã QR đặt trước thất bại");
  }
};
