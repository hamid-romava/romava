const roles = [
  ["کارگردانی و دکوپاژ", 10], ["دیسکاوری", 10], ["اسکریپت و پست‌پروداکشن", 15],
  ["ادیت و آفیش", 15], ["اکانت‌منیجری", 2], ["استوریست", 2.5],
];

const dashboardRole = ["سهم داشبورد سایت از اکانت‌منیجری", 0.5];
const roleWeight = roles.reduce((total, [, weight]) => total + weight, dashboardRole[1]);

const exchangeUnit = 1_000;

export function parseProjectAmount(input, unit = 1) {
  const text = input.trim()
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
    .replace(/٫/g, ".").replace(/٬/g, ",");
  if (!text) return null;
  if (!/^(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?|\.\d+)$/.test(text)) return NaN;
  return Number(text.replaceAll(",", "")) * unit;
}

export function calculateProjectShares(projectAmount, exchangeRate = 1) {
  if (!Number.isFinite(projectAmount) || projectAmount < 0) {
    throw new Error("مبلغ پروژه باید یه عدد معتبر و نامنفی باشه.");
  }
  const threshold = 200 * exchangeRate;
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new Error("قیمت دلار باید یه عدد معتبر و بزرگ‌تر از صفر باشه.");
  }
  const baseAmount = Math.min(projectAmount, threshold);
  const extraAmount = Math.max(projectAmount - threshold, 0);
  const extraTeamBudget = extraAmount * 0.30;
  const share = (name, baseShare, extraShare = 0) => {
    const amount = baseShare + extraShare;
    return { name, baseShare, extraShare, amount, percentage: projectAmount ? (amount / projectAmount) * 100 : 0 };
  };
  const roleShare = ([name, weight]) => share(name, baseAmount * (weight / 100), extraTeamBudget * (weight / roleWeight));
  const teamShares = roles.map(roleShare);
  const dashboard = roleShare(dashboardRole);
  const teamAmount = teamShares.reduce((sum, role) => sum + role.amount, 0);
  const teamTotal = { name: "جمع تیم اجرایی", amount: teamAmount, percentage: projectAmount ? (teamAmount / projectAmount) * 100 : 0 };
  const projectSupport = share("مدیریت پروژه، تجهیزات و ایاب‌وذهاب", baseAmount * 0.10);
  const romavaCore = share("سهم پایهٔ روماوا", baseAmount * 0.35, extraAmount * 0.70);
  const romava = share("سهم روماوا", romavaCore.baseShare + dashboard.baseShare, romavaCore.extraShare + dashboard.extraShare);
  return { projectAmount, baseAmount, extraAmount, extraTeamBudget, teamShares, teamTotal, projectSupport, romava, romavaCore, dashboard,
    allocatedTotal: teamAmount + projectSupport.amount + romava.amount };
}

const calculator = typeof document !== "undefined" && document.querySelector("#project-calculator");
if (calculator) {
  const plan = calculator.querySelector("#project-plan");
  const customFields = calculator.querySelector("#project-custom-fields");
  const custom = calculator.querySelector("#project-custom");
  const customError = calculator.querySelector("#project-custom-error");
  const exchange = calculator.querySelector("#project-exchange");
  const exchangeError = calculator.querySelector("#project-exchange-error");
  const choices = calculator.querySelector("#project-roles");
  const personal = calculator.querySelector("#project-personal");
  const personalAmountOutput = personal.querySelector("#project-personal-amount");
  const personalRateOutput = personal.querySelector("#project-personal-rate");
  [...roles.map(([name]) => name), "مدیریت پروژه و استراتژی", "جذب", "اکانت منیجری اتوماتیک"].forEach((name, index) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = index;
    checkbox.disabled = index >= roles.length;
    label.append(checkbox, name);
    choices.append(label);
  });
  const results = calculator.querySelector("#project-results");
  const table = results.querySelector("tbody");
  const cards = results.querySelector("#project-totals");
  const extra = results.querySelector("#project-extra");
  const format = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
  const money = amount => format.format(amount) + " تومان";
  const millions = amount => format.format(amount / 1_000_000);
  const rate = percentage => format.format(percentage) + "٪";
  const romavaDescription = "شامل هزینه‌های ماهانه، اجاره، سایت، جذب و اکانت منیجری با داشبورد";

  function update() {
    const usesCustom = plan.value === "custom";
    customFields.hidden = !usesCustom;
    const amount = usesCustom ? parseProjectAmount(custom.value, 1_000_000) : Number(plan.selectedOptions[0]?.dataset.price);
    const invalidCustom = usesCustom && amount !== null && (!Number.isFinite(amount) || amount <= 0);
    customError.hidden = !invalidCustom;
    custom.setAttribute("aria-invalid", String(invalidCustom));
    const exchangeRate = parseProjectAmount(exchange.value, exchangeUnit);
    const validExchange = exchangeRate > 0 && Number.isFinite(200 * exchangeRate);
    const invalidExchange = exchangeRate !== null && !validExchange;
    exchangeError.hidden = !invalidExchange;
    exchange.setAttribute("aria-invalid", String(invalidExchange));
    results.hidden = !Number.isFinite(amount) || amount <= 0 || !validExchange;
    if (results.hidden) return;

    const data = calculateProjectShares(amount, exchangeRate);
    const selected = Array.from(choices.querySelectorAll("input:checked:not(:disabled)"));
    const personalAmount = selected.reduce((sum, checkbox) => sum + data.teamShares[Number(checkbox.value)].amount, 0);
    personal.hidden = selected.length === 0;
    personalAmountOutput.textContent = money(personalAmount);
    personalRateOutput.textContent = rate((personalAmount / amount) * 100) + " از کل پروژه";
    cards.innerHTML = [data.teamTotal, data.projectSupport, data.romava].map(row =>
      `<article><span>${row.name}</span><strong>${money(row.amount)}</strong><span>${rate(row.percentage)} از کل پروژه</span>${row === data.romava ? `<small>${romavaDescription}</small>` : ""}</article>`).join("");
    table.innerHTML = [...data.teamShares, data.teamTotal, data.projectSupport, data.romavaCore, data.dashboard].map(row =>
      `<tr${row === data.teamTotal ? ' class="team-total"' : ""}><th scope="row">${row.name}${row === data.dashboard ? " (در جمع کارت روماوا)" : ""}</th><td>${millions(row.amount)}</td><td>${rate(row.percentage)}</td></tr>`).join("");
    results.querySelector("tfoot td").textContent = millions(data.allocatedTotal);
    results.querySelector("tfoot tr td:last-child").textContent = rate(amount ? 100 : 0);
    extra.hidden = data.extraAmount === 0;
    extra.textContent = extra.hidden ? "" : `از ${money(data.extraAmount)} اضافه بر مرز ${money(data.baseAmount)}، ${money(data.extraTeamBudget - data.dashboard.extraShare)} به تیم اجرایی و ${money(data.romava.extraShare)} به روماوا می‌رسه. سهم داشبورد سایت هم داخل مبلغ روماواست.`;
  }

  plan.addEventListener("change", update);
  custom.addEventListener("input", update);
  exchange.addEventListener("input", update);
  choices.addEventListener("change", update);
  update();
}
