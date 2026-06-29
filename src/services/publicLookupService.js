import publicAxiosClient from "../api/publicAxiosClient";

export const publicLookupService = {
  getCardActiveSession: async (qrToken) => {
    const response = await publicAxiosClient.get(`/public/lookup/${qrToken}`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Không tìm thấy vé đỗ xe đang hoạt động.");
  }
};
