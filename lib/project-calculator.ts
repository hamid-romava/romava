import type { pricedPlans } from "./pricing-plans";

export function projectCalculator(plans: ReturnType<typeof pricedPlans>) {
  const format = new Intl.NumberFormat("fa-IR");
  return `<style>
.project-calculator label{display:block;margin-bottom:6px;font-weight:700}
.project-calculator select{width:100%;max-width:320px}
.project-calculator input[type=text]{max-width:320px;direction:ltr;text-align:right}
.project-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}
#project-personal-title{margin:0}
.project-role-instructions{margin:4px 0 16px;color:#626d80}
.project-role-grid{display:grid;gap:8px}
.project-role-grid details,.project-role-grid > .project-direct-role{border:1px solid #e3e6ec;border-radius:10px;background:#fff}
.project-role-grid summary{padding:9px 12px;cursor:pointer;background:#f6f7f9;border-radius:9px}
.project-role-grid details[open] summary{border-radius:9px 9px 0 0;border-bottom:1px solid #e9ebef}
.project-role-grid summary::marker{color:#647088}
.project-role-grid summary span{float:left}
.project-role-grid summary span,.project-task-weight{font-size:.82em;font-weight:400;color:#68758a;font-variant-numeric:tabular-nums;text-align:left}
.project-role-tasks{display:grid}
.project-role-grid label{display:flex;gap:9px;align-items:center;min-height:44px;font-weight:400;margin:0;padding:6px 12px;cursor:pointer}
.project-role-tasks label+label{border-top:1px solid #f0f1f4}
.project-role-grid > .project-direct-role{font-weight:700}
.project-role-grid label:has(input:checked){background:#f3f6ff}
.project-role-grid label:has(input:disabled){color:#697486;cursor:default}
.project-task-weight{margin-inline-start:auto}
.project-role-grid input{width:17px;height:17px;flex:none;margin:0;accent-color:#244dff}
.project-personal-romava input{width:100%;margin-bottom:0}
#project-personal{margin-top:16px}
#project-personal:not([hidden]){display:grid;gap:4px;padding:16px;background:#f7f8fa;border:1px solid #e1e5ec;border-radius:13px}
#project-personal strong{font-size:24px}
#project-totals{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:12px;margin:16px 0}
#project-totals article{display:grid;gap:4px;background:#fff;padding:16px;border:1px solid #e1e5ec;border-radius:13px;align-content:start}
#project-totals strong{font-size:24px}
.project-calculator table{width:100%;border-collapse:collapse;text-align:right;font-size:clamp(12px,3vw,15px)}
.project-calculator :is(th,td){padding:10px 6px;border-bottom:1px solid #e4e9f2}
.project-calculator td{white-space:nowrap}
.project-calculator .team-total,.project-calculator tfoot{background:#f5f6f8;font-weight:700}
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
      <div class="project-personal-romava">
        <label for="project-romava-rate">درصد از سهم روماوا (اختیاری)</label>
        <input id="project-romava-rate" type="text" inputmode="decimal" autocomplete="off" value="۰" aria-describedby="project-romava-help project-romava-error">
        <small id="project-romava-help">مثلاً ۱۰ یعنی ۱۰٪ از مبلغ کارت «سهم روماوا».</small>
        <p id="project-romava-error" role="alert" hidden>یه درصد بین صفر تا ۱۰۰ وارد کن.</p>
      </div>
    </div>
  </section>
  <section id="project-results" hidden>
    <section class="card" aria-labelledby="project-personal-title">
      <h2 id="project-personal-title">انتخاب کارهای انجام‌شده</h2>
      <p class="project-role-instructions">هر کاری رو که انجام دادی تیک بزن تا سهمت حساب بشه.</p>
      <div class="project-role-grid" id="project-roles"></div>
      <output id="project-personal" hidden>
        <span>سهم شما از پروژه</span>
        <strong id="project-personal-amount"></strong>
        <span id="project-personal-rate"></span>
        <small id="project-personal-romava" hidden></small>
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
