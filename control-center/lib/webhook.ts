// Shared checks for the user-saved webhook. Values are never returned to any client.
const DENIED_HEADERS = new Set([
  "host", "cookie", "set-cookie", "content-type", "content-length",
  "transfer-encoding", "connection", "te", "upgrade", "trailer", "keep-alive",
  "proxy-authorization", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto",
  "x-real-ip", "forwarded",
]);

export function headerOk(header: string): boolean {
  if (!/^[A-Za-z0-9-]{1,64}$/.test(header)) return false;
  return !DENIED_HEADERS.has(header.toLowerCase());
}

export function webhookTargetOk(url: string): boolean {
  if (url.length < 12 || url.length > 2000) return false;
  let u: URL;
  try { u = new URL(url); } catch { return false; }
  if (u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host) return false;
  if (
    host === "localhost" || host.endsWith(".localhost") ||
    host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" ||
    host === "169.254.169.254" || host === "metadata.google.internal" ||
    host.endsWith(".internal") || host.endsWith(".local")
  ) return false;
  if (host.includes(":")) return false; // raw IPv6: require a public DNS name
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const o = ipv4.slice(1).map(Number);
    if (o.some((n) => n > 255)) return false;
    const [a, b] = o;
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
        (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || a >= 224) return false;
  }
  return true;
}

// Flatten control chars / newlines so one queued line cannot inject extra numbered commands.
export function sanitizeCommandItem(s: string): string {
  return s.replace(/[\x00-\x1F\x7F\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000);
}

export const REFRESH_MSG = "Refresh the control center data";

export function buildCommandText(items: string[], isRefresh: boolean): string {
  if (isRefresh) return REFRESH_MSG;
  return `${items.length} request(s) from the control center:\n` + items.map((m, i) => `${i + 1}. ${m}`).join("\n");
}
