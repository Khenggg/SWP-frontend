const CHANNEL_NAME = "gate-simulator-channel";
const STORAGE_KEY_PREFIX = "last_gate_scan_";

let channel = null;
try {
  channel = new BroadcastChannel(CHANNEL_NAME);
} catch (e) {
  console.warn("BroadcastChannel is not supported or accessible", e);
}

const listeners = new Set();

if (channel) {
  channel.onmessage = (event) => {
    const scanEvent = event.data;
    listeners.forEach((cb) => cb(scanEvent));
  };
}

window.addEventListener("storage", (event) => {
  if (event.key && event.key.startsWith(STORAGE_KEY_PREFIX)) {
    try {
      const scanEvent = JSON.parse(event.newValue);
      listeners.forEach((cb) => cb(scanEvent));
    } catch (e) {
      // ignore
    }
  }
});

export function sendGateScanEvent(event) {
  const normalized = normalizeGateScanEvent(event);
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${normalized.gateType}`, JSON.stringify(normalized));
  localStorage.setItem(`${STORAGE_KEY_PREFIX}LATEST`, JSON.stringify(normalized));
  
  if (channel) {
    channel.postMessage(normalized);
  }
  
  listeners.forEach((cb) => cb(normalized));
  return normalized;
}

export function getLastGateScanEvent(gateType) {
  const item = localStorage.getItem(`${STORAGE_KEY_PREFIX}${gateType}`);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function clearLastGateScanEvent() {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}ENTRY`);
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}EXIT`);
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}LATEST`);
  const clearEvent = { type: "CLEAR" };
  if (channel) {
    channel.postMessage(clearEvent);
  }
  listeners.forEach((cb) => cb(clearEvent));
}

export function subscribeGateScanEvents(callback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function normalizeGateScanEvent(event) {
  return {
    id: event.id || `evt_${Date.now()}`,
    gateType: event.gateType || "ENTRY",
    scanType: event.scanType || "CARD",
    gateCode: event.gateCode || (event.gateType === "ENTRY" ? "GATE-IN-01" : "GATE-OUT-01"),
    cardCode: event.cardCode || "",
    bookingId: event.bookingId || "",
    qrToken: event.qrToken || "",
    detectedPlate: event.detectedPlate || "",
    vehicleTypeName: event.vehicleTypeName || "Xe Máy",
    plateConfidence: event.plateConfidence !== undefined ? event.plateConfidence : 100,
    plateImageDataUrl: event.plateImageDataUrl || "",
    vehicleImageDataUrl: event.vehicleImageDataUrl || "",
    driverImageDataUrl: event.driverImageDataUrl || "",
    capturedAt: event.capturedAt || new Date().toISOString(),
  };
}
