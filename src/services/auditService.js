import supportAxiosClient from "../api/supportAxiosClient";

export const auditService = {
  getAuditLogs: async (params) => {
    const response = await supportAxiosClient.get("/audit-logs", { params });
    if (response.success) {
      return response.data;
    }
    return [];
  },
  
  // [CHƯA HOÀN THIỆN TỪ BACKEND] API xuất Excel
  exportAuditLogs: async (params) => {
    const response = await supportAxiosClient.get("/audit-logs/export-excel", { params, responseType: 'blob' });
    return response; // Trả về blob để download
  }
};
