import { plans } from "./pricing-plans";
const planIds: Record<string, string> = { base: "seed", vangogh: "cypress", davinci: "bamboo" };
export const meetingPlans = plans.map(plan => ({ id: planIds[plan.kind], name: plan.name, description: plan.purpose, priceToman: Number(plan.price.replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))) * 1000000 }));

export type MeetingBooking = { plan: string; shootDate: string; shootSlot: "morning" | "afternoon"; paymentModel: "full" | "split"; firstPaymentDate: string; secondPaymentDate: string | null; totalPrice?: number; firstPaymentAmount?: number; secondPaymentAmount?: number | null };
export function tehranToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(p => p.type === type)!.value).join("-");
}
export function addDays(day: string, days: number) { const date = new Date(day + "T12:00:00Z"); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
export function validDate(day: unknown): day is string { return typeof day === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day + "T12:00:00Z")) && new Date(day + "T12:00:00Z").toISOString().slice(0, 10) === day; }
export function validateBooking(input: unknown, today = tehranToday()): MeetingBooking | null {
  if (!input || typeof input !== "object") return null;
  const b = input as Record<string, unknown>;
  if (!meetingPlans.some(plan => plan.id === b.plan) || !validDate(b.shootDate) || b.shootDate < addDays(today, 3) || b.shootDate > addDays(today, 7) || !["morning", "afternoon"].includes(String(b.shootSlot)) || !["full", "split"].includes(String(b.paymentModel)) || !validDate(b.firstPaymentDate) || b.firstPaymentDate < today || b.firstPaymentDate >= b.shootDate) return null;
  if (b.paymentModel === "split" && (!validDate(b.secondPaymentDate) || b.secondPaymentDate <= b.firstPaymentDate || b.secondPaymentDate > addDays(b.firstPaymentDate, 14))) return null;
  const totalPrice = meetingPlans.find(plan => plan.id === b.plan)!.priceToman;
  return { totalPrice, firstPaymentAmount: b.paymentModel === "split" ? totalPrice / 2 : totalPrice, secondPaymentAmount: b.paymentModel === "split" ? totalPrice / 2 : null, plan: String(b.plan), shootDate: b.shootDate, shootSlot: b.shootSlot as MeetingBooking["shootSlot"], paymentModel: b.paymentModel as MeetingBooking["paymentModel"], firstPaymentDate: b.firstPaymentDate, secondPaymentDate: b.paymentModel === "split" ? String(b.secondPaymentDate) : null };
}
export function bookingLines(b: MeetingBooking) {
  const date = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "Asia/Tehran" }).format(new Date(value + "T12:00:00Z"));
  const money = (value: number | undefined) => value === undefined ? "" : ` · ${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
  return [`طرح ${meetingPlans.find(p => p.id === b.plan)?.name || b.plan}${money(b.totalPrice)}`, `آفیش پیشنهادی: ${date(b.shootDate)} · ${b.shootSlot === "morning" ? "۱۰ تا ۱۴" : "۱۶ تا ۲۰"}`, b.paymentModel === "split" ? `پرداخت ۵۰–۵۰ · قسط اول: ${date(b.firstPaymentDate)}${money(b.firstPaymentAmount)} · قسط دوم: ${date(b.secondPaymentDate!)}${money(b.secondPaymentAmount ?? undefined)}` : `پرداخت کامل: ${date(b.firstPaymentDate)}${money(b.firstPaymentAmount)}`].join("\n");
}

export function reportMeetingMonth(report: { months?: Record<string, unknown> }) { return Math.max(1, ...Object.keys(report.months || {}).filter(key => /^[1-9]\d*$/.test(key)).map(Number)); }
export function meetingMonthTitle(month: number) { const names = ["", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم", "یازدهم", "دوازدهم"]; const label = (n: number) => names[n] || new Intl.NumberFormat("fa-IR").format(n); return `بررسی ماه ${label(month)} و تمدید ماه ${label(month + 1)}`; }
