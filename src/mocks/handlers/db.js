import { getMockData, saveMockData } from "../mockStorage";
import { 
  MOCK_PARKING_INFO, MOCK_FLOORS, MOCK_AREAS, MOCK_SLOTS, 
  MOCK_GATES, MOCK_PRICING_RULES, MOCK_MONTHLY_PASSES, MOCK_CARDS,
  MOCK_USERS
} from "../mockData";

export const db = {
  getFloors: () => getMockData("floors", MOCK_FLOORS),
  saveFloors: (data) => saveMockData("floors", data),

  getAreas: () => getMockData("areas", MOCK_AREAS),
  saveAreas: (data) => saveMockData("areas", data),

  getSlots: () => getMockData("slots", MOCK_SLOTS),
  saveSlots: (data) => saveMockData("slots", data),

  getGates: () => getMockData("gates", MOCK_GATES),
  saveGates: (data) => saveMockData("gates", data),

  getPricingRules: () => getMockData("pricing_rules", MOCK_PRICING_RULES),
  savePricingRules: (data) => saveMockData("pricing_rules", data),

  getMonthlyPasses: () => getMockData("monthly_passes", MOCK_MONTHLY_PASSES),
  saveMonthlyPasses: (data) => saveMockData("monthly_passes", data),

  getCards: () => getMockData("cards", MOCK_CARDS),
  saveCards: (data) => saveMockData("cards", data),

  getParkingInfo: () => getMockData("parking_info", MOCK_PARKING_INFO),
  saveParkingInfo: (data) => saveMockData("parking_info", data),

  getUsers: () => getMockData("users", MOCK_USERS),
  saveUsers: (data) => saveMockData("users", data),

  getBookings: () => getMockData("bookings", [
    {
      id: "BK-100001",
      username: "driver02",
      areaCode: "B2-A",
      areaName: "Khu A - Tầng B2",
      floorCode: "B2",
      vehicleTypeName: "Ô Tô",
      hours: 3,
      reservationFee: 60000,
      fee: 60000,
      actualParkingFee: 0,
      actualHours: 0,
      status: "PAID",
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      checkInTime: null,
      checkOutTime: null,
      plate: null,
      internalSlotId: 201,
      internalSlotCode: "B2-A-011",
    }
  ]),
  saveBookings: (data) => saveMockData("bookings", data),

  getHistory: () => getMockData("history", {
    driver01: [
      {
        id: "BK-090002",
        username: "driver01",
        areaCode: "B2-A",
        areaName: "Khu A - Tầng B2",
        floorCode: "B2",
        vehicleTypeName: "Ô Tô",
        hours: 2,
        reservationFee: 40000,
        fee: 40000,
        actualParkingFee: 60000,
        actualHours: 3,
        status: "COMPLETED",
        createdAt: "2026-06-09T01:00:00.000Z",
        paidAt: "2026-06-09T01:05:00.000Z",
        checkInTime: "2026-06-09T01:30:00.000Z",
        checkOutTime: "2026-06-09T04:10:00.000Z",
        plate: "51A-888.88",
        internalSlotId: 202,
        internalSlotCode: "B2-A-012"
      }
    ],
    driver02: [
      {
        id: "BK-090001",
        username: "driver02",
        areaCode: "B2-B",
        areaName: "Khu B - Tầng B2",
        floorCode: "B2",
        vehicleTypeName: "Ô Tô",
        hours: 2,
        reservationFee: 40000,
        fee: 40000,
        actualParkingFee: 60000,
        actualHours: 3,
        status: "COMPLETED",
        createdAt: "2026-06-09T01:00:00.000Z",
        paidAt: "2026-06-09T01:05:00.000Z",
        checkInTime: "2026-06-09T01:30:00.000Z",
        checkOutTime: "2026-06-09T04:10:00.000Z",
        plate: "29A-999.99",
        internalSlotId: 222,
        internalSlotCode: "B2-B-012",
      }
    ]
  }),
  saveHistory: (data) => saveMockData("history", data),
};
