import { hasEnabledMocks } from "./mockConfig";

export async function enableMocking() {
  if (!hasEnabledMocks()) return;

  const { worker } = await import("./browser");

  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}
