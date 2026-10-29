import { createHash, timingSafeEqual } from "node:crypto";
import { reportTemplate } from "@/lib/report-template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

type Report = { passwordHash: string; data: Record<string, unknown> };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[a-f0-9]{48}$/.test(token)) {
    return new Response("Not found", { status: 404, headers });
  }

  let reports: Record<string, Report>;
  try {
    reports = JSON.parse(process.env.ROMAVA_REPORTS_CONFIG || "{}");
  } catch {
    return new Response("Reports unavailable", { status: 503, headers });
  }
  const report = reports[hash(token)];
  if (!report || !/^[a-f0-9]{64}$/.test(report.passwordHash)) {
    return new Response("Not found", { status: 404, headers });
  }

  const authorization = request.headers.get("authorization") || "";
  let username = "", password = "";
  if (authorization.startsWith("Basic ")) {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator >= 0) {
      username = decoded.slice(0, separator);
      password = decoded.slice(separator + 1);
    }
  }
  const validPassword = timingSafeEqual(
    Buffer.from(hash(password), "hex"),
    Buffer.from(report.passwordHash, "hex"),
  );
  if (username !== "report" || !validPassword) {
    return new Response("برای دیدن گزارش، نام کاربری و رمز عبور را وارد کنید.", {
      status: 401,
      headers: {
        ...headers,
        "Content-Type": "text/plain; charset=utf-8",
        "WWW-Authenticate": `Basic realm="Report ${hash(token).slice(0, 12)}", charset="UTF-8"`,
      },
    });
  }

  const data = JSON.stringify(report.data).replace(/</g, "\\u003c");
  return new Response(reportTemplate.replace("__REPORT_DATA__", () => data), {
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}
