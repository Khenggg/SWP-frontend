import supportAxiosClient from "../api/supportAxiosClient";

export const reportService = {
  getSummary: async (params) => {
    // Note: Assuming summary endpoint exists on support backend based on worklog
    const response = await supportAxiosClient.get("/reports/summary", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy tổng quan báo cáo");
  },

  getRevenue: async (params) => {
    const response = await supportAxiosClient.get("/reports/revenue", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo doanh thu");
  },

  getTraffic: async (params) => {
    const response = await supportAxiosClient.get("/reports/traffic", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo lưu lượng");
  },

  getOccupancy: async (params) => {
    const response = await supportAxiosClient.get("/reports/occupancy", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo công suất");
  },

  getCardsReport: async (params) => {
    const response = await supportAxiosClient.get("/reports/cards", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo thẻ");
  },

  getSessionsReport: async (params) => {
    const response = await supportAxiosClient.get("/reports/sessions", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo phiên");
  },

  exportExcel: async (params) => {
    const response = await supportAxiosClient.get("/reports/export-excel", { 
      params,
      responseType: 'blob' // Assuming this returns a file
    });
    return response; 
  }
};
