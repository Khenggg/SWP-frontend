import coreAxiosClient from "../api/coreAxiosClient";

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await coreAxiosClient.get("/manager/dashboard/stats");
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể lấy số liệu thống kê.");
  },

  getRecentActivities: async () => {
    const response = await coreAxiosClient.get("/manager/dashboard/recent-activities");
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể lấy danh sách xe vừa vào bãi.");
  }
};
