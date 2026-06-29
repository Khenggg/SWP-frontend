import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, enabled } from "./helpers";

export const authHandlers = [
  ...enabled(
    MOCK_FLAGS.AUTH_LOGIN,
    http.post(`${API_BASE_URLS.core}/auth/login`, async ({ request }) => {
      await delay(250);
      const { username, password } = await request.json();
      
      const seedUsers = {
        admin01: { username: "admin01", fullName: "Quản Trị Viên Hệ Thống", role: "ADMIN", email: "admin01@parking.vn", phone: "0901000001" },
        manager01: { username: "manager01", fullName: "Quản Lý Bãi Xe", role: "MANAGER", email: "manager01@parking.vn", phone: "0901000002" },
        staff01: { username: "staff01", fullName: "Nhân Viên Cổng Vận Hành", role: "STAFF", email: "staff01@parking.vn", phone: "0901000003" },
        driver01: { username: "driver01", fullName: "Nguyễn Văn A", role: "DRIVER", phone: "0912345678", email: "driver01@parking.vn" },
        driver02: { username: "driver02", fullName: "Trần Văn B", role: "DRIVER", phone: "0987654321", email: "driver02@booking.vn" },
      };

      const userKey = username.trim().toLowerCase();
      const user = seedUsers[userKey];

      if (user && password === "password123") {
        return ok({
          token: `mock-token-for-${userKey}`,
          user
        });
      }
      return badRequest("Tên đăng nhập hoặc mật khẩu không chính xác.");
    })
  ),
];
