import coreAxiosClient from "../api/coreAxiosClient";

const SESSION_KEY = "currentUser";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await coreAxiosClient.post("/auth/login", { username, password });
      if (response.success && response.data) {
        return response.data; // contains { token, user }
      }
      throw new Error(response.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    } catch (err) {
      // Bất kể Backend (.NET) trả về tiếng Anh ("Login failed", "Incorrect username or password."),
      // ta chủ động đè lại bằng tiếng Việt để giao diện thân thiện với người dùng.
      throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("accessToken");
  },

  getCurrentUser: () => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Lỗi đọc session user", e);
      }
    }
    return null;
  }
};
