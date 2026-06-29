import coreAxiosClient from "../api/coreAxiosClient";

export const vehicleService = {
  getMonthlyPasses: async () => {
    const response = await coreAxiosClient.get("/manager/monthly-passes");
    return response.success ? response.data : [];
  },

  getVehiclesByOwner: async () => {
    // Current logged in driver's vehicles
    const response = await coreAxiosClient.get("/driver/vehicles");
    return response.success ? response.data : [];
  },

  addMonthlyPass: async (passData) => {
    const response = await coreAxiosClient.post("/manager/monthly-passes", passData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm vé tháng thất bại");
  },

  updateMonthlyPassStatus: async (passId, newStatus) => {
    const response = await coreAxiosClient.put(`/manager/monthly-passes/${passId}/status`, { status: newStatus });
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật trạng thái vé tháng thất bại");
  },

  renewMonthlyPass: async (passId, newEndDate) => {
    const response = await coreAxiosClient.put(`/manager/monthly-passes/${passId}/renew`, { endDate: newEndDate });
    if (response.success) return response.data;
    throw new Error(response.message || "Gia hạn vé tháng thất bại");
  }
};
