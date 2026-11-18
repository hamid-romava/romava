import type { MongoClient } from "mongodb";
import { defaultPricing, type PricingSettings, type PlanId } from "./pricing-plans";

const recordId = "plan-pricing";
const planIds = Object.keys(defaultPricing) as PlanId[];

async function collection() {
  const { default: connection } = await import("@/lib/mongodb") as { default: Promise<MongoClient> | null };
  const client = await connection;
  if (!client) throw new Error("Pricing storage unavailable");
  return client.db("mydb").collection<{ _id: string; pricing: PricingSettings }>("studioSettings");
}

export async function getPricing(): Promise<PricingSettings> {
  const row = await (await collection()).findOne({ _id: recordId });
  return row?.pricing ?? defaultPricing;
}

export function pricingFromForm(form: FormData): PricingSettings | null {
  const pricing = { ...defaultPricing };
  for (const id of planIds) {
    const priceToman = integer(form.get(`${id}-price`));
    const discount = integer(form.get(`${id}-discount`));
    if (priceToman < 1 || priceToman > 1_000_000_000_000 || discount < 0 || discount > 100) return null;
    pricing[id] = { priceToman, discount };
  }
  return pricing;
}

function integer(input: FormDataEntryValue | null): number {
  if (typeof input !== "string") return -1;
  const normalized = input.trim().replace(/[۰-۹٠-٩]/g, digit => String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10));
  return /^\d{1,13}$/.test(normalized) ? Number(normalized) : -1;
}

export async function savePricing(pricing: PricingSettings) {
  await (await collection()).updateOne({ _id: recordId }, { $set: { pricing } }, { upsert: true });
}
