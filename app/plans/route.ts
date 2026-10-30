import { reportHeaders } from "@/lib/report-auth";

export function GET() {
  return new Response(null, { status: 303, headers: { ...reportHeaders, Location: "/r/plans" } });
}
