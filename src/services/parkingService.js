import coreAxiosClient from "../api/coreAxiosClient";
import publicAxiosClient from "../api/publicAxiosClient";

export const parkingService = {
  // Public APIs
  getParkingInfo: async () => {
    const res = await publicAxiosClient.get("/parking-info");
    return res.success ? res.data : null;
  },

  getAvailableSlots: async () => {
    const res = await publicAxiosClient.get("/available-slots");
    return res.success ? res.data : { areas: [], slots: [], floors: [], vehicleTypes: [] };
  },

  // Manager/Common APIs
  getFloors: async () => {
    // For convenience and simplicity, retrieve from /available-slots
    const res = await publicAxiosClient.get("/available-slots");
    return res.success ? res.data.floors : [];
  },

  getAreas: async () => {
    const res = await publicAxiosClient.get("/available-slots");
    return res.success ? res.data.areas : [];
  },

  getSlots: async () => {
    const res = await publicAxiosClient.get("/available-slots");
    return res.success ? res.data.slots : [];
  },

  getGates: async () => {
    const res = await coreAxiosClient.get("/manager/structures/gates");
    return res.success ? res.data : [];
  },

  getVehicleTypes: async () => {
    const res = await publicAxiosClient.get("/vehicle-types");
    return res.success ? res.data : [];
  },

  // Add / Edit structures (Manager actions)
  addFloor: async (floorData) => {
    const res = await coreAxiosClient.post("/manager/structures/floors", floorData);
    if (res.success) return res.data;
    throw new Error(res.message || "Thêm tầng thất bại");
  },

  updateFloor: async (id, floorData) => {
    const res = await coreAxiosClient.put(`/manager/structures/floors/${id}`, floorData);
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật tầng thất bại");
  },

  updateSlotStatus: async (id, status) => {
    const res = await coreAxiosClient.put(`/manager/structures/slots/${id}/status`, { status });
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật slot thất bại");
  }
};
