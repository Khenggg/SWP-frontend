import coreAxiosClient from "../api/coreAxiosClient";

export const adminSessionService = {
  // [CHƯA HOÀN THIỆN TỪ BACKEND] API lấy danh sách phiên có phân trang/filter
  getSessions: async (params = {}) => {
    try {
      const response = await coreAxiosClient.get("/parking-sessions/search", { params });
      return response.success ? response.data : [];
    } catch (error) {
      return [];
    }
  },

  getActiveSessions: async () => {
    // API có thể sử dụng search với status=ACTIVE nếu chưa có endpoint riêng
    const response = await coreAxiosClient.get("/parking-sessions/search", { params: { status: 'ACTIVE' } });
    if (response.success) {
      return response.data;
    }
    return [];
  },



  cancel: async (sessionId, { reason }) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/cancel`, { reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Hủy phiên thất bại");
  },

  moveSlot: async (sessionId, { reason, newSlotId }) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/move-slot`, { reason, newSlotId });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Điều chuyển vị trí đỗ thất bại");
  }
};
