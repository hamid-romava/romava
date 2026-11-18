// Shared source for the plans page and meeting renewal amounts.
export const plans = [
  { name: "بذر", subtitle: "بذر، آغاز زندگی و نقطه‌ی شروع رشد", purpose: "۸ محتوا", purposeLine: "برای شروع", count: "۸", guarantee: "در این طرح ارائه نمی‌شود", extras: [], kind: "base", label: "شروع مسیر" },
  { name: "سرو", subtitle: "سرو، گیاهی با رشد پیوسته و حضوری ماندگار", purpose: "۸ محتوا + تضمین نتیجه", purposeLine: "برای رشد پیوسته", count: "۸", guarantee: "افزایش ۱۰۰۰ فالوور یا ۲۰۰ هزار بازدید", extras: [1], kind: "vangogh", label: "رشد پیوسته" },
  { name: "بامبو", subtitle: "بامبو، رکورددار سریع‌ترین رشد در میان گیاهان", purpose: "۱۲ محتوا + تضمین نتیجه", purposeLine: "برای رشد سریع", count: "۱۲", guarantee: "افزایش ۲ هزار فالور", extras: [0, 1, 2, 3], kind: "davinci", label: "کامل‌ترین طرح" },
] as const;

export const planIds = { base: "seed", vangogh: "cypress", davinci: "bamboo" } as const;
export type PlanId = typeof planIds[keyof typeof planIds];
export type PricingSettings = Record<PlanId, { priceToman: number; discount: number }>;

export const defaultPricing: PricingSettings = {
  seed: { priceToman: 45_000_000, discount: 0 },
  cypress: { priceToman: 63_000_000, discount: 5 },
  bamboo: { priceToman: 107_000_000, discount: 10 },
};

export function pricedPlans(pricing = defaultPricing) {
  return plans.map(plan => {
    const id = planIds[plan.kind];
    return { ...plan, extras: [...plan.extras] as number[], id, ...pricing[id] };
  });
}
