import type { pricedPlans } from "./pricing-plans";

export function projectCalculator(plans: ReturnType<typeof pricedPlans>) {
  const format = new Intl.NumberFormat("fa-IR");
  return `<style>
.project-calculator label{display:block;margin-bottom:6px;font-weight:700}
.project-calculator select{width:100%;max-width:320px}
.project-calculator input[type=text]{max-width:320px;direction:ltr;text-align:right}
.project-fields,.project-role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}
.project-role-grid label{display:flex;gap:8px;align-items:center;font-weight:400;margin:0;background:#edf2ff;padding:10px;border-radius:10px;cursor:pointer}
.project-role-grid label:has(input:disabled){background:#f1f3f7;color:#5d687b;cursor:default}
.project-role-grid input{width:18px;height:18px;margin:0;accent-color:#244dff}
#project-personal{margin-top:16px}
#project-personal:not([hidden]){display:grid;gap:4px;padding:16px;background:#edf2ff;border:1px solid #d9e3ff;border-radius:13px}
#project-personal strong{font-size:24px}
#project-totals{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:12px;margin:16px 0}
#project-totals article{display:grid;gap:4px;background:#edf2ff;padding:16px;border-radius:13px;align-content:start}
#project-totals strong{font-size:24px}
.project-calculator table{width:100%;border-collapse:collapse;text-align:right;font-size:clamp(12px,3vw,15px)}
.project-calculator :is(th,td){padding:10px 6px;border-bottom:1px solid #e4e9f2}
.project-calculator td{white-space:nowrap}
.project-calculator .team-total,.project-calculator tfoot{background:#edf2ff;font-weight:700}
.project-calculator [role=alert]{color:#9a302a}
</style><main class="project-calculator" id="project-calculator">
  <section class="card">
    <div class="project-fields">
      <div><label for="project-plan">انتخاب طرح</label>
        <select id="project-plan">
          <option value="">طرحت رو انتخاب کن</option>
          ${plans.map(plan => `<option value="${plan.id}" data-price="${plan.priceToman}">${plan.name} · ${format.format(plan.priceToman)} تومان</option>`).join("")}
          <option value="custom">مبلغ دلخواه</option>
        </select>
      </div>
      <div><label for="project-exchange">قیمت یک دلار (هزار تومان)</label>
        <input id="project-exchange" type="text" inputmode="decimal" autocomplete="off" placeholder="مثلاً ۱۰۰" aria-describedby="project-exchange-error">
        <p id="project-exchange-error" role="alert" hidden>قیمت دلار باید یه عدد معتبر و بزرگ‌تر از صفر باشه.</p>
      </div>
      <div id="project-custom-fields" hidden>
        <label for="project-custom">مبلغ دلخواه (میلیون تومان)</label>
        <input id="project-custom" type="text" inputmode="decimal" autocomplete="off" placeholder="مثلاً ۵۰" aria-describedby="project-custom-error">
        <p id="project-custom-error" role="alert" hidden>مبلغ پروژه باید یه عدد معتبر و بزرگ‌تر از صفر باشه.</p>
      </div>
    </div>
  </section>
  <section id="project-results" hidden>
    <section class="card" aria-labelledby="project-personal-title">
      <h2 id="project-personal-title">نقش‌ها</h2>
      <div class="project-role-grid" id="project-roles"></div>
      <output id="project-personal" hidden>
        <span>سهم شما از پروژه</span>
        <strong id="project-personal-amount"></strong>
        <span id="project-personal-rate"></span>
      </output>
    </section>
    <div id="project-totals"></div>
    <p class="notice" id="project-extra" hidden></p>
    <section class="card"><h2>جزئیات تقسیم درآمد</h2>
      <table><thead><tr><th scope="col">نقش یا بخش</th><th scope="col">مبلغ (میلیون تومان)</th><th scope="col">درصد از کل</th></tr></thead>
      <tbody></tbody><tfoot><tr><th scope="row">جمع کل</th><td></td><td></td></tr></tfoot></table>
    </section>
  </section>
</main><script type="module" src="/project-shares.mjs"></script>`;
}
