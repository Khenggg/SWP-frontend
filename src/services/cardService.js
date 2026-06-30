import coreAxiosClient from "../api/coreAxiosClient";

export const cardService = {
  getCards: async (status = "", search = "") => {
    const params = {};
    if (status && status !== "ALL") params.status = status;
    if (search) params.search = search;
    const response = await coreAxiosClient.get("/cards", { params });
    if (response.success) {
      return response.data;
    }
    return [];
  },

  addCard: async (cardNumber, note = "") => {
    const response = await coreAxiosClient.post("/cards", { cardNumber, note });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Tạo thẻ xe thất bại");
  },

  updateCardStatus: async (cardId, newStatus) => {
    // Backend expects [FromBody] string status, which is a JSON string
    const response = await coreAxiosClient.patch(`/cards/${cardId}/status`, `"${newStatus}"`, {
      headers: { "Content-Type": "application/json" }
    });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Cập nhật trạng thái thẻ thất bại");
  }
};
