export const GA_ID = "G-QCCJ5BGKL9";

export function event(action: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}
