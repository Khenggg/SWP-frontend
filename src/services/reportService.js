import coreAxiosClient from "../api/coreAxiosClient";

export const reportService = {
  getSummary: async (params) => {
    const response = await coreAxiosClient.get("/manager/reports/summary", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy tổng quan báo cáo");
  },

  getRevenue: async (params) => {
    const response = await coreAxiosClient.get("/manager/reports/revenue", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo doanh thu");
  },

  getTraffic: async (params) => {
    const response = await coreAxiosClient.get("/manager/reports/traffic", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo lưu lượng");
  },

  getOccupancy: async (params) => {
    const response = await coreAxiosClient.get("/manager/reports/occupancy", { params });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy báo cáo công suất");
  }
};
