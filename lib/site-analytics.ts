import { createSign } from "node:crypto";

export const siteStages = [
  ["romava_home_view", "بازدید صفحهٔ اصلی"],
  ["romava_scroll_25", "رسیدن به ۲۵٪ صفحه"],
  ["romava_scroll_50", "رسیدن به ۵۰٪ صفحه"],
  ["romava_scroll_75", "رسیدن به ۷۵٪ صفحه"],
  ["romava_scroll_90", "رسیدن به ۹۰٪ صفحه"],
  ["romava_contact_open", "باز کردن فرم مشاوره"],
  ["romava_contact_success", "ثبت موفق درخواست"],
] as const;

async function accessToken(serviceAccount: string) {
  const { client_email, private_key } = JSON.parse(serviceAccount);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const endpoint = "https://oauth2.googleapis.com/token";
  const claims = encode({
    iss: client_email, scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: endpoint, iat: now, exp: now + 3600,
  });
  const unsigned = encode({ alg: "RS256", typ: "JWT" }) + "." + claims;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(private_key, "base64url");
  const response = await fetch(endpoint, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: unsigned + "." + signature,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Google Analytics authorization failed");
  return (await response.json()).access_token as string;
}

type Row = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };

export async function siteAnalytics(days: 7 | 30) {
  const property = process.env.ROMAVA_GA_PROPERTY_ID;
  const account = process.env.ROMAVA_GA_SERVICE_ACCOUNT;
  if (!property || !/^\d+$/.test(property) || !account) return null;

  const token = await accessToken(account);
  async function report(query: object): Promise<Row[]> {
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }], ...query }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Google Analytics report unavailable");
    return (await response.json()).rows ?? [];
  }

  const [stages, channels] = await Promise.all([
    report({
      dimensions: [{ name: "eventName" }], metrics: [{ name: "totalUsers" }],
      dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: siteStages.map(([event]) => event) } } },
    }),
    report({
      dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "romava_home_view" } } },
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "8",
    }),
  ]);
  const counts = new Map(stages.map(row => [row.dimensionValues[0].value, Number(row.metricValues[0].value)]));
  return {
    stages: siteStages.map(([event, label]) => ({ label, count: counts.get(event) ?? 0 })),
    channels: channels.map(row => ({ label: row.dimensionValues[0].value, count: Number(row.metricValues[0].value) })),
  };
}
