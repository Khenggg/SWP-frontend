import coreAxiosClient from "../api/coreAxiosClient";

export const adminSessionService = {
  getActiveSessions: async () => {
    const response = await coreAxiosClient.get("/admin/sessions/active");
    if (response.success) {
      return response.data;
    }
    return [];
  },

  forceClose: async (sessionId, { reason }) => {
    const response = await coreAxiosClient.post(`/admin/sessions/${sessionId}/force-close`, { reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Cưỡng chế đóng phiên thất bại");
  },

  cancel: async (sessionId, { reason }) => {
    const response = await coreAxiosClient.post(`/admin/sessions/${sessionId}/cancel`, { reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Hủy phiên thất bại");
  },

  moveSlot: async (sessionId, { reason, newSlotId }) => {
    const response = await coreAxiosClient.post(`/admin/sessions/${sessionId}/move-slot`, { reason, newSlotId });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Điều chuyển vị trí đỗ thất bại");
  }
};
