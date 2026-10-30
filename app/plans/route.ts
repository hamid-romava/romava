import { timingSafeEqual, createHash } from "node:crypto";
import { pricingTemplate } from "@/lib/pricing-template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
};
const digest = (value: string) => createHash("sha256").update(value).digest();

export async function GET(request: Request) {
  const password = process.env.ROMAVA_PLANS_PASSWORD;
  if (!password) return new Response("Not found", { status: 404, headers });
  const authorization = request.headers.get("authorization") || "";
  const decoded = /^Basic [A-Za-z0-9+/]+=*$/i.test(authorization)
    ? Buffer.from(authorization.slice(6), "base64").toString("utf8") : "";
  const separator = decoded.indexOf(":");
  const valid = separator >= 0 && timingSafeEqual(digest(decoded.slice(0, separator)), digest("romava"))
    && timingSafeEqual(digest(decoded.slice(separator + 1)), digest(password));
  if (!valid) return new Response("ورود به این صفحه نیاز به رمز دارد.", {
    status: 401,
    headers: { ...headers, "Content-Type": "text/plain; charset=utf-8", "WWW-Authenticate": 'Basic realm="Romava plans", charset="UTF-8"' },
  });
  return new Response(pricingTemplate(), { headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
}
