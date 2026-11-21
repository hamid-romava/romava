import { createHmac, randomBytes } from "node:crypto";
import { equal } from "@/lib/report-auth";
const cookieName = "romava_team_session";
export type TeamRole = "manager" | "creator";

export function teamPasswordHash(role: TeamRole) {
  const managerHash = process.env.ROMAVA_TEAM_PASSWORD_HASH;
  const hash = role === "manager" ? managerHash : process.env.ROMAVA_CREATOR_PASSWORD_HASH;
  return hash && /^[a-f0-9]{64}$/.test(hash) && (role === "manager" || hash !== managerHash) ? hash : null;
}

const mac = (value: string, hash: string, role: TeamRole) =>
  createHmac("sha256", hash).update(`team-v1:${role === "creator" ? "creator:" : ""}${value}`).digest("hex");

export function teamConfigured() { return Boolean(teamPasswordHash("manager") || teamPasswordHash("creator")); }

export function teamRole(request: Request): TeamRole | null {
  const [expiry, signature, ...extra] = readCookie(request, cookieName).split(".");
  const now = Math.floor(Date.now() / 1000);
  if (extra.length || !/^\d{10}$/.test(expiry) || Number(expiry) <= now || Number(expiry) > now + 28800 || !/^[a-f0-9]{64}$/.test(signature || "")) return null;
  for (const role of ["manager", "creator"] as const) {
    const hash = teamPasswordHash(role);
    if (hash && equal(signature, mac(expiry, hash, role))) return role;
  }
  return null;
}

export function teamAuthenticated(request: Request) { return teamRole(request) !== null; }
export function readCookie(request: Request, name: string) { return (request.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(name + "="))?.slice(name.length + 1) || ""; }
export function teamCookie(request: Request, logout = false, role: TeamRole = "manager") {
  const expiry = String(Math.floor(Date.now() / 1000) + 28800);
  const hash = teamPasswordHash(role);
  if (!logout && !hash) throw new Error("Team role unavailable");
  return `${cookieName}=${logout ? "" : `${expiry}.${mac(expiry, hash!, role)}`}; Path=/blackhorse; HttpOnly; SameSite=Strict; Max-Age=${logout ? 0 : 28800}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export function loginNonce() { return randomBytes(24).toString("hex"); }
