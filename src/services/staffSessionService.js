import coreAxiosClient from "../api/coreAxiosClient";

export const staffSessionService = {
  listActiveSessions: async () => {
    const response = await coreAxiosClient.get("/staff/sessions/active");
    if (response.success) return response.data;
    return [];
  },

  searchActiveSession: async ({ cardCode, plate }) => {
    const response = await coreAxiosClient.get("/staff/sessions/search", {
      params: { cardCode, plate }
    });
    if (response.success) return response.data;
    throw new Error(response.message || "Không tìm thấy phiên đỗ xe hoạt động.");
  },

  previewFee: async (sessionId, exitTime) => {
    const response = await coreAxiosClient.post(`/staff/sessions/${sessionId}/preview-fee`, { exitTime });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể tính phí gửi xe.");
  },

  payCash: async (sessionId, receivedAmount) => {
    const response = await coreAxiosClient.post(`/staff/sessions/${sessionId}/pay-cash`, { receivedAmount });
    if (response.success) return response.data;
    throw new Error(response.message || "Thanh toán tiền mặt thất bại.");
  },

  createMismatchCase: async ({ sessionId, exitPlateNumber, reason }) => {
    const response = await coreAxiosClient.post(`/staff/sessions/${sessionId}/mismatch-case`, { exitPlateNumber, reason });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể tạo hồ sơ lệch biển số.");
  },

  completeExit: async (sessionId, { exitTime, exitGateCode }) => {
    const response = await coreAxiosClient.post(`/staff/sessions/${sessionId}/complete-exit`, { exitTime, exitGateCode });
    if (response.success) return response.data;
    throw new Error(response.message || "Xác nhận xe ra thất bại.");
  },

  createLostCardCase: async ({ reporterName, phone, verificationNote, reason, sessionId }) => {
    const response = await coreAxiosClient.post(`/staff/sessions/${sessionId}/lost-card`, {
      reporterName,
      phone,
      verificationNote,
      reason
    });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể tạo báo cáo mất thẻ.");
  }
};
