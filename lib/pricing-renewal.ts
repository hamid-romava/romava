const renewalPlans = [
  { name: "سرو", price: 53_000_000, discount: 5, kind: "sarv" },
  { name: "بامبو", price: 87_000_000, discount: 10, kind: "bamboo" },
];
const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

export const renewalTemplate = `<section class="renewal" aria-labelledby="renewal-title">
<h2 id="renewal-title">تخفیف همکاری بلندمدت</h2>
<p class="renewal-intro">اگه بعد از ۳ ماه افتخار تمدید همکاریتون رو داشته باشیم، یا از همون ابتدا طرح رو برای بیش از ۳ ماه خریداری کنین، تخفیف‌های زیر شامل حالتون می‌شه.</p>
<div class="renewal-grid">${renewalPlans.map(plan => `<article class="renewal-card ${plan.kind}">
<div class="renewal-heading"><h3>طرح ${plan.name}</h3><span>${money(plan.discount)}٪ تخفیف</span></div>
<p class="renewal-original">قیمت اصلی: <del>${money(plan.price)}</del> تومان</p>
<p class="renewal-price"><span>قیمت با تخفیف</span><strong>${money(plan.price * (100 - plan.discount) / 100)}</strong> تومان</p>
</article>`).join("")}</div>
</section>`;

export const renewalStyles = `.renewal{max-width:1000px;padding:0 24px;margin:0 auto 64px}.renewal h2{text-align:right;font-size:25px;margin:0 0 8px}.renewal-intro,.renewal-note{font-size:14px;color:#64748b}.renewal-eligibility{border:0;padding:0;margin:12px 0 0;font-size:14px;color:#526078}.renewal-eligibility li{margin:6px 0}.renewal-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}.renewal-card{background:#f0f4ff;border:1px solid #cad5f5;border-radius:22px;padding:24px}.renewal-card.bamboo{background:#fcf7e9;border-color:#e6d29b}.renewal-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}.renewal-heading h3{font-size:20px;margin:0}.renewal-heading>span{font-size:12px;padding:4px 12px;border-radius:20px;background:#dfe7ff;color:#2254f6}.bamboo .renewal-heading>span{background:#f0dfa9;color:#805f0e}.renewal-original{font-size:13px;color:#7f8795;margin:22px 0 10px}.renewal-price{font-size:14px;margin:0;color:#526078}.renewal-price>span{display:block;font-size:12px;margin-bottom:5px}.renewal-price strong{font-size:23px;font-weight:400;color:#17243b;margin-left:6px}.renewal-note{font-size:12px;margin-top:14px}@media(max-width:740px){.renewal-grid{grid-template-columns:1fr}.renewal-card.bamboo{order:-1}.renewal h2{font-size:22px}}`;
