import coreAxiosClient from "../api/coreAxiosClient";

export const approvalService = {
  getLostCardCases: async () => {
    const response = await coreAxiosClient.get("/manager/approvals/lost-cards");
    if (response.success) {
      return response.data;
    }
    return [];
  },

  decideLostCardCase: async (caseId, { decision, reason }) => {
    const response = await coreAxiosClient.post(`/manager/approvals/lost-cards/${caseId}/decide`, { decision, reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Xử lý hồ sơ mất thẻ thất bại");
  },

  getMismatchCases: async () => {
    const response = await coreAxiosClient.get("/manager/approvals/mismatch");
    if (response.success) {
      return response.data;
    }
    return [];
  },

  decideMismatchCase: async (caseId, { decision, reason }) => {
    const response = await coreAxiosClient.post(`/manager/approvals/mismatch/${caseId}/decide`, { decision, reason });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Xử lý hồ sơ lệch biển số thất bại");
  }
};
