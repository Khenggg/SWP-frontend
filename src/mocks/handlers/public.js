import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { MOCK_VEHICLE_TYPES } from "../mockData";
import { ok, enabled } from "./helpers";
import { db } from "./db";

export const publicHandlers = [
  ...enabled(
    MOCK_FLAGS.PUBLIC_PARKING_INFO,
    http.get(`${API_BASE_URLS.public}/parking-info`, async () => {
      await delay(250);
      return ok(db.getParkingInfo());
    })
  ),

  ...enabled(
    MOCK_FLAGS.PUBLIC_PRICING,
    http.get(`${API_BASE_URLS.public}/pricing`, async () => {
      await delay(250);
      return ok(db.getPricingRules());
    })
  ),

  ...enabled(
    MOCK_FLAGS.PUBLIC_AVAILABLE_SLOTS,
    http.get(`${API_BASE_URLS.public}/available-slots`, async () => {
      await delay(250);
      return ok({ 
        areas: db.getAreas(), 
        slots: db.getSlots(), 
        floors: db.getFloors(),
        vehicleTypes: MOCK_VEHICLE_TYPES 
      });
    })
  ),
];
