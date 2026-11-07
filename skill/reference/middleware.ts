import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Private app: never offer this origin to search engines. Token URLs must not be indexed.
export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
