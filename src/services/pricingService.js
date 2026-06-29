import coreAxiosClient from "../api/coreAxiosClient";
import publicAxiosClient from "../api/publicAxiosClient";

export const pricingService = {
  getPricingRules: async () => {
    const response = await publicAxiosClient.get("/pricing");
    return response.success ? response.data : [];
  },

  addPricingRule: async (ruleData) => {
    const response = await coreAxiosClient.post("/manager/pricing", ruleData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm bảng giá thất bại");
  },

  updatePricingRule: async (ruleId, updatedData) => {
    const response = await coreAxiosClient.put(`/manager/pricing/${ruleId}`, updatedData);
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật bảng giá thất bại");
  }
};
