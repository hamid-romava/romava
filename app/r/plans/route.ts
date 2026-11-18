import { getPricing } from "../../../lib/pricing-store";
import { clientNavigation } from "../../../lib/dashboard-navigation";
import { pricingTemplate } from "@/lib/pricing-template";
import { authenticated, reports } from "@/lib/report-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
};
export async function GET(request: Request) {
  let report;
  try { report = Object.values(reports()).find(item => authenticated(request, item)); }
  catch { return new Response("Reports unavailable", { status: 503, headers }); }
  if (!report) return new Response(null, { status: 303, headers: { ...headers, Location: "/admin" } });
  const pricing = await getPricing().catch(() => null);
  if (!pricing) return new Response("Pricing unavailable", { status: 503, headers });
  if (new URL(request.url).searchParams.get("sheet") === "1") {
    return new Response(pricingTemplate({ embedded: true, pricing }), {
      headers: {
        ...headers,
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": headers["Content-Security-Policy"].replace("frame-ancestors 'none'", "frame-ancestors 'self'"),
      },
    });
  }
  const html = pricingTemplate({ pricing }).replace('<span class="private">', `<a class="private dashboard-back" href="/r/${report.token}">بازگشت به داشبورد ←</a><span class="private">`);
  return new Response(clientNavigation(html, report.token, "/r/plans"), { headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
}
