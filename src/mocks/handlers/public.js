import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { MOCK_VEHICLE_TYPES } from "../mockData";
import { ok, enabled } from "./helpers";
import { db } from "./db";
export const publicHandlers = [
  // Parking Info
  ...enabled(
    MOCK_FLAGS.PUBLIC_PARKING_INFO,
    http.get(`${API_BASE_URLS.public}/parking-info`, async () => {
      await delay(250);
      return ok(db.getParkingInfo());
    })
  ),

  // Pricing rules
  ...enabled(
    MOCK_FLAGS.PUBLIC_PRICING,
    http.get(`${API_BASE_URLS.public}/pricing`, async () => {
      await delay(250);
      return ok(db.getPricingRules());
    })
  ),

  // Vehicle types (dùng cho trang Bảng giá filter)
  ...enabled(
    MOCK_FLAGS.PUBLIC_PRICING,
    http.get(`${API_BASE_URLS.public}/vehicle-types`, async () => {
      await delay(250);
      return ok(MOCK_VEHICLE_TYPES);
    })
  ),

  // Available slots — trả về mảng slot đúng format backend
  ...enabled(
    MOCK_FLAGS.PUBLIC_AVAILABLE_SLOTS,
    http.get(`${API_BASE_URLS.public}/available-slots`, async () => {
      await delay(250);
      const availableSlots = db.getSlots()
        .filter((s) => s.status === "AVAILABLE")
        .map((s) => ({
          id:                   s.id,
          slotCode:             s.code,
          areaId:               s.areaId,
          vehicleTypeId:        s.allowedVehicleTypeId ?? null,
          // bonus fields present in mock but not backend — frontend ignores these
          areaCode:             s.areaCode,
          floorCode:            s.floorCode,
          vehicleTypeName:      s.vehicleTypeName,
        }));
      return ok(availableSlots);
    })
  ),
];
