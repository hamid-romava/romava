import { brandbookTemplate } from "@/lib/brandbook-template";

export function GET() {
  return new Response(brandbookTemplate, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
