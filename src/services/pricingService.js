import coreAxiosClient from "../api/coreAxiosClient";
import publicAxiosClient from "../api/publicAxiosClient";

export const pricingService = {
  // Public API cho guest/driver
  getPublicPricing: async () => {
    const response = await publicAxiosClient.get("/pricing");
    return response.success ? response.data : [];
  },

  // [CHƯA HOÀN THIỆN TỪ BACKEND] API lấy danh sách rules cho Manager (có phân trang, filter)
  getPricingRules: async (params = {}) => {
    // Tạm thời gọi public api nếu backend manager chưa có, hoặc cứ gọi core
    // Theo docs spec: GET /api/core/pricing-rules
    try {
      const response = await coreAxiosClient.get("/pricing-rules", { params });
      return response.success ? response.data : [];
    } catch (error) {
      // Fallback cho quá trình dev nếu backend chưa có api core
      const fallback = await publicAxiosClient.get("/pricing");
      return fallback.success ? fallback.data : [];
    }
  },

  // [CHƯA HOÀN THIỆN TỪ BACKEND] API lấy chi tiết 1 rule
  getPricingRuleById: async (ruleId) => {
    const response = await coreAxiosClient.get(`/pricing-rules/${ruleId}`);
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy chi tiết bảng giá");
  },

  addPricingRule: async (ruleData) => {
    // Theo docs: POST /api/core/pricing-rules
    const response = await coreAxiosClient.post("/pricing-rules", ruleData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm bảng giá thất bại");
  },

  updatePricingRule: async (ruleId, updatedData) => {
    // Theo docs: PUT /api/core/pricing-rules/{id}
    const response = await coreAxiosClient.put(`/pricing-rules/${ruleId}`, updatedData);
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật bảng giá thất bại");
  }
};
