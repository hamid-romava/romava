export function GET() {
  return new Response(null, {
    status: 307,
    headers: { Location: "/r/collaboration", "Cache-Control": "no-store" },
  });
}
