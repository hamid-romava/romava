import { validateBooking, type MeetingBooking } from "@/lib/meeting-booking";
import mongoose from "mongoose";
import { hash } from "@/lib/report-auth";

export const meetingKeys = ["liked", "improve", "results", "next-month", "ideas"] as const;
export type MeetingAnswers = { notes: Record<string, string>; ready: Record<string, boolean>; booking?: MeetingBooking };
export type MeetingRecord = MeetingAnswers & { _id: string; doctorId: string; doctorName: string; cycle: string; sessionId?: string; revision: number; reportMonth?: number; renewalMonth?: number; meetingTitle?: string; updatedAt: Date };
let connection: Promise<mongoose.Connection> | undefined;
export function currentCycle() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find(p => p.type === "year")!.value}-${parts.find(p => p.type === "month")!.value}`;
}
export function validCycle(value: unknown): value is string { return typeof value === "string" && /^20\d{2}-(0[1-9]|1[0-2])$/.test(value); }
export function validateAnswers(input: unknown, requireBooking = false): MeetingAnswers | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  if (!value.notes || typeof value.notes !== "object" || Array.isArray(value.notes) || !value.ready || typeof value.ready !== "object" || Array.isArray(value.ready)) return null;
  const notes: Record<string, string> = {}, ready: Record<string, boolean> = {};
  for (const key of meetingKeys) {
    const note = (value.notes as Record<string, unknown>)[key];
    const checked = (value.ready as Record<string, unknown>)[key];
    if (typeof note !== "string" || note.length > 6000 || typeof checked !== "boolean") return null;
    notes[key] = note; ready[key] = checked;
  }
  const booking = value.booking === undefined ? undefined : validateBooking(value.booking);
  if ((requireBooking && !booking) || booking === null) return null;
  return { notes, ready, ...(booking ? { booking } : {}) };
}
async function collection() {
  if (!process.env.MONGODB_URI) throw new Error("Meeting storage unavailable");
  connection ??= mongoose.createConnection(process.env.MONGODB_URI, { dbName: "mydb", serverSelectionTimeoutMS: 5000 }).asPromise().catch(error => { connection = undefined; throw error; });
  const db = (await connection).db;
  if (!db) throw new Error("Meeting storage unavailable");
  return db.collection<MeetingRecord>("meeting_answers");
}
export function validSession(value: unknown): value is string { return typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value); }
export async function getMeeting(token: string, sessionId: string) { return (await collection()).findOne({ _id: `${hash(token)}:${sessionId}` }); }
export async function saveMeeting(token: string, doctorName: string, sessionId: string, answers: MeetingAnswers, context?: { reportMonth: number; renewalMonth: number; meetingTitle: string }) {
  const col = await collection(), doctorId = hash(token), updatedAt = new Date();
  try {
    await col.insertOne({ _id: `${doctorId}:${sessionId}`, doctorId, doctorName, cycle: currentCycle(), sessionId, ...answers, ...context, revision: 1, updatedAt });
    return { sessionId, updatedAt };
  } catch (error) { if ((error as { code?: number }).code === 11000) return null; throw error; }
}
export async function clientMeetings(token: string) {
  return (await collection()).find({ doctorId: hash(token) }, { projection: { _id: 0, doctorId: 0, doctorName: 0 } }).sort({ updatedAt: -1 }).limit(200).toArray();
}
export async function listMeetings() { return (await collection()).find({}, { projection: { _id: 0, doctorId: 0 } }).sort({ updatedAt: -1 }).limit(200).toArray(); }
