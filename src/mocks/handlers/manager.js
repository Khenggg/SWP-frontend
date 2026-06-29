import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, notFound, enabled } from "./helpers";
import { db } from "./db";
let mockDashboardRevenue = 3980000;
let mockDashboardEntries = 187;
let mockDashboardExits = 172;
let mockDashboardIncidents = 2;
let mockRecentActivities = [
  { type: "Ô Tô", plate: "30F-888.88", gate: "GATE-IN-01", time: "22:40:15" },
  { type: "Xe Máy", plate: "29H1-123.45", gate: "GATE-IN-02", time: "22:38:10" },
  { type: "Ô Tô", plate: "51K-999.99", gate: "GATE-IN-01", time: "22:35:45" },
  { type: "Xe Máy", plate: "43C1-567.89", gate: "GATE-IN-02", time: "22:32:00" },
];

export const managerHandlers = [
  // =========================================================================
  // MANAGER CARD MANAGEMENT
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.get(`${API_BASE_URLS.core}/manager/cards`, async () => {
      await delay(250);
      return ok(db.getCards());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.post(`${API_BASE_URLS.core}/manager/cards`, async ({ request }) => {
      await delay(250);
      const { code, note } = await request.json();
      let inMemoryCards = db.getCards();
      
      if (inMemoryCards.some(c => c.code.trim().toUpperCase() === code.trim().toUpperCase())) {
        return badRequest("Mã thẻ này đã tồn tại trên hệ thống!");
      }
      const newCard = {
        id: Date.now(),
        code: code.trim(),
        status: "AVAILABLE",
        note: note || "",
        updatedAt: new Date().toISOString(),
        activeSession: null
      };
      inMemoryCards.push(newCard);
      db.saveCards(inMemoryCards);
      return ok(newCard);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.put(`${API_BASE_URLS.core}/manager/cards/:id/status`, async ({ params, request }) => {
      await delay(250);
      const cardId = Number(params.id);
      const { status } = await request.json();
      
      let inMemoryCards = db.getCards();
      const index = inMemoryCards.findIndex(c => c.id === cardId);
      if (index === -1) return notFound("Không tìm thấy thẻ xe.");

      if (inMemoryCards[index].status === "IN_USE" && status !== "IN_USE") {
        return badRequest("Không thể cập nhật trạng thái của thẻ đang sử dụng!");
      }

      inMemoryCards[index].status = status;
      inMemoryCards[index].updatedAt = new Date().toISOString();
      db.saveCards(inMemoryCards);
      return ok(inMemoryCards[index]);
    })
  ),

  // =========================================================================
  // MANAGER MONTHLY PASSES
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.get(`${API_BASE_URLS.core}/manager/monthly-passes`, async () => {
      await delay(250);
      return ok(db.getMonthlyPasses());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.post(`${API_BASE_URLS.core}/manager/monthly-passes`, async ({ request }) => {
      await delay(250);
      const passData = await request.json();
      let inMemoryPasses = db.getMonthlyPasses();
      const newPass = {
        id: Date.now(),
        ...passData,
        createdAt: new Date().toISOString()
      };
      inMemoryPasses.push(newPass);
      db.saveMonthlyPasses(inMemoryPasses);
      return ok(newPass);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.put(`${API_BASE_URLS.core}/manager/monthly-passes/:id/status`, async ({ params, request }) => {
      await delay(250);
      const passId = Number(params.id);
      const { status } = await request.json();
      
      let inMemoryPasses = db.getMonthlyPasses();
      const index = inMemoryPasses.findIndex(p => p.id === passId);
      if (index === -1) return notFound("Không tìm thấy vé tháng.");

      inMemoryPasses[index].status = status;
      db.saveMonthlyPasses(inMemoryPasses);
      return ok(inMemoryPasses[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.put(`${API_BASE_URLS.core}/manager/monthly-passes/:id/renew`, async ({ params, request }) => {
      await delay(250);
      const passId = Number(params.id);
      const { endDate } = await request.json();
      
      let inMemoryPasses = db.getMonthlyPasses();
      const index = inMemoryPasses.findIndex(p => p.id === passId);
      if (index === -1) return notFound("Không tìm thấy vé tháng.");

      inMemoryPasses[index].endDate = endDate;
      inMemoryPasses[index].status = "ACTIVE";
      db.saveMonthlyPasses(inMemoryPasses);
      return ok(inMemoryPasses[index]);
    })
  ),

  // =========================================================================
  // MANAGER STRUCTURES
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/floors`, async () => {
      await delay(250);
      return ok(db.getFloors());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.post(`${API_BASE_URLS.core}/manager/structures/floors`, async ({ request }) => {
      await delay(250);
      const floorData = await request.json();
      let inMemoryFloors = db.getFloors();
      const newFloor = {
        id: Date.now(),
        ...floorData,
        totalAreas: 0,
        totalSlots: 0
      };
      inMemoryFloors.push(newFloor);
      db.saveFloors(inMemoryFloors);
      return ok(newFloor);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.put(`${API_BASE_URLS.core}/manager/structures/floors/:id`, async ({ params, request }) => {
      await delay(250);
      const floorId = Number(params.id);
      const floorData = await request.json();
      
      let inMemoryFloors = db.getFloors();
      const index = inMemoryFloors.findIndex(f => f.id === floorId);
      if (index === -1) return notFound("Không tìm thấy tầng.");

      inMemoryFloors[index] = { ...inMemoryFloors[index], ...floorData };
      db.saveFloors(inMemoryFloors);
      return ok(inMemoryFloors[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/areas`, async () => {
      await delay(250);
      return ok(db.getAreas());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/slots`, async () => {
      await delay(250);
      return ok(db.getSlots());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.put(`${API_BASE_URLS.core}/manager/structures/slots/:id/status`, async ({ params, request }) => {
      await delay(250);
      const slotId = Number(params.id);
      const { status } = await request.json();

      let inMemorySlots = db.getSlots();
      const index = inMemorySlots.findIndex(s => s.id === slotId);
      if (index === -1) return notFound("Không tìm thấy slot.");

      inMemorySlots[index].status = status;
      db.saveSlots(inMemorySlots);
      return ok(inMemorySlots[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/gates`, async () => {
      await delay(250);
      return ok(db.getGates());
    })
  ),

  // =========================================================================
  // MANAGER PRICING
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.get(`${API_BASE_URLS.core}/manager/pricing`, async () => {
      await delay(250);
      return ok(db.getPricingRules());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.post(`${API_BASE_URLS.core}/manager/pricing`, async ({ request }) => {
      await delay(250);
      const ruleData = await request.json();
      let inMemoryPricingRules = db.getPricingRules();
      const newRule = {
        id: Date.now(),
        ...ruleData,
        updatedAt: new Date().toISOString()
      };
      inMemoryPricingRules.push(newRule);
      db.savePricingRules(inMemoryPricingRules);
      return ok(newRule);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.put(`${API_BASE_URLS.core}/manager/pricing/:id`, async ({ params, request }) => {
      await delay(250);
      const ruleId = Number(params.id);
      const ruleData = await request.json();

      let inMemoryPricingRules = db.getPricingRules();
      const index = inMemoryPricingRules.findIndex(r => r.id === ruleId);
      if (index === -1) return notFound("Không tìm thấy bảng giá.");

      inMemoryPricingRules[index] = {
        ...inMemoryPricingRules[index],
        ...ruleData,
        updatedAt: new Date().toISOString()
      };
      db.savePricingRules(inMemoryPricingRules);
      return ok(inMemoryPricingRules[index]);
    })
  ),

  // =========================================================================
  // MANAGER DASHBOARD (LIVE SIMULATION)
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_DASHBOARD,
    http.get(`${API_BASE_URLS.core}/manager/dashboard/stats`, async () => {
      await delay(250);
      // Simulate real-time increment on some requests
      if (Math.random() > 0.4) {
        mockDashboardRevenue += Math.floor(Math.random() * 4) * 5000; // Increment 0đ - 15,000đ
        mockDashboardEntries += Math.random() > 0.6 ? 1 : 0;
        mockDashboardExits += Math.random() > 0.65 ? 1 : 0;
        if (Math.random() > 0.95) {
          mockDashboardIncidents += 1;
        }
      }
      return ok({
        revenueToday: mockDashboardRevenue,
        entriesToday: mockDashboardEntries,
        exitsToday: mockDashboardExits,
        incidents: mockDashboardIncidents
      });
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_DASHBOARD,
    http.get(`${API_BASE_URLS.core}/manager/dashboard/recent-activities`, async () => {
      await delay(200);
      // Occasionally simulate a new vehicle entering the building
      if (Math.random() > 0.7) {
        const plates = ["51K-777.77", "30G-654.32", "43A-999.88", "14A-123.45", "99A-555.55", "30F-555.55", "51H-123.45"];
        const types = ["Ô Tô", "Xe Máy"];
        const gates = ["GATE-IN-01", "GATE-IN-02"];
        const newPlate = plates[Math.floor(Math.random() * plates.length)];
        const newType = types[Math.floor(Math.random() * types.length)];
        const newGate = gates[Math.floor(Math.random() * gates.length)];
        const now = new Date();
        const newTime = now.toTimeString().split(" ")[0];

        mockRecentActivities.unshift({
          type: newType,
          plate: newPlate,
          gate: newGate,
          time: newTime
        });

        if (mockRecentActivities.length > 5) {
          mockRecentActivities.pop();
        }
      }
      return ok(mockRecentActivities);
    })
  ),
];
