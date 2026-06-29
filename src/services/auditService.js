import coreAxiosClient from "../api/coreAxiosClient";

export const auditService = {
  getAuditLogs: async (params) => {
    const response = await coreAxiosClient.get("/manager/audit-logs", { params });
    if (response.success) {
      return response.data;
    }
    return [];
  }
};
