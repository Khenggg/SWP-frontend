import coreAxiosClient from "../api/coreAxiosClient";

export const approvalService = {
  getLostCardCases: async () => {
    const response = await coreAxiosClient.get("/lost-card-cases");
    if (response.success) {
      return response.data;
    }
    return [];
  },

  approveLostCardCase: async (caseId, { reason }) => {
    const response = await coreAxiosClient.post(`/lost-card-cases/${caseId}/approve`, { reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Phê duyệt hồ sơ mất thẻ thất bại");
  },

  rejectLostCardCase: async (caseId, { reason }) => {
    const response = await coreAxiosClient.post(`/lost-card-cases/${caseId}/reject`, { reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Từ chối hồ sơ mất thẻ thất bại");
  },

  getMismatchCases: async () => {
    const response = await coreAxiosClient.get("/plate-mismatch-cases");
    if (response.success) {
      return response.data;
    }
    return [];
  },

  confirmMismatchCase: async (sessionId, { reason }) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/mismatch/confirm`, { reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Phê duyệt lệch biển số thất bại");
  },

  rejectMismatchCase: async (sessionId, { reason }) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/mismatch/reject`, { reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Từ chối lệch biển số thất bại");
  }
};
