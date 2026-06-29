import coreAxiosClient from "../api/coreAxiosClient";

export const cardService = {
  getCards: async () => {
    const response = await coreAxiosClient.get("/manager/cards");
    if (response.success) {
      return response.data;
    }
    return [];
  },

  addCard: async (code, note = "") => {
    const response = await coreAxiosClient.post("/manager/cards", { code, note });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Tạo thẻ xe thất bại");
  },

  updateCardStatus: async (cardId, newStatus) => {
    const response = await coreAxiosClient.put(`/manager/cards/${cardId}/status`, { status: newStatus });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Cập nhật trạng thái thẻ thất bại");
  }
};
