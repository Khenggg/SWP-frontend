import { HttpResponse } from "msw";
import { isMockEnabled } from "../mockConfig";

export const ok = (data, message = "OK") => HttpResponse.json({ success: true, message, data });
export const badRequest = (message) => HttpResponse.json({ success: false, message }, { status: 400 });
export const unauthorized = (message) => HttpResponse.json({ success: false, message }, { status: 401 });
export const notFound = (message) => HttpResponse.json({ success: false, message }, { status: 404 });

export const enabled = (flagName, handler) => (isMockEnabled(flagName) ? [handler] : []);

export const getUsernameFromHeader = (request) => {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer mock-token-for-")) {
    return authHeader.replace("Bearer mock-token-for-", "").trim().toLowerCase();
  }
  return "driver01";
};
