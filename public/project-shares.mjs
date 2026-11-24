const dashboardRole = ["گزارش سیستمی", 0.5];
const management = { name: "مدیر پروژه", weight: 2.5, extraWeight: 0, tasks: ["مدیریت پروژه"], locked: true };
const acquisition = { name: "جذب", weight: 2, tasks: ["جذب"], locked: true };
const roles = [
  { name: "کاوشگر (دیسکاوری)", weight: 10, tasks: ["دیسکاوری"] },
  { name: "نویسنده و آنالیزور", weight: 15, tasks: ["اسکریپت", "آنالیز"], taskWeights: [14, 1] },
  { name: "کارگردان", weight: 10, tasks: ["دکوپاژ", "آفیش کارگردانی", "هماهنگی و انتشار"], taskWeights: [3.5, 4.5, 2] },
  { name: "تصویرگر (ادیتور)", weight: 15, extraWeight: 12.5, tasks: ["ادیت"] },
  { name: "آچار فرانسه", weight: 5, tasks: ["آفیش کمک", "استوریست"], taskWeights: [2.5, 2.5], automated: dashboardRole },
  management,
  acquisition,
];
const roleWeight = roles.reduce((total, role) => total + (role.extraWeight ?? role.weight), dashboardRole[1]);

function taskWeight(weight, weights, index, count) {
  return weights ? weight * (weights[index] / weights.reduce((sum, part) => sum + part, 0)) : weight / count;
}

function weightedTasks({ weight, tasks, taskWeights, extraWeight = weight, extraTaskWeights = taskWeights }) {
  return tasks.map((name, index) => [
    name, taskWeight(weight, taskWeights, index, tasks.length),
    taskWeight(extraWeight, extraTaskWeights, index, tasks.length),
  ]);
}

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
  const roleShare = ([name, weight, extraWeight = weight]) => share(name, baseAmount * (weight / 100), extraTeamBudget * (extraWeight / roleWeight));
  const teamShares = roles.filter(role => role.weight > 0 && !role.locked).map(role => ({
    ...roleShare([role.name, role.weight, role.extraWeight]),
    tasks: weightedTasks(role).map(roleShare),
  }));
  const dashboard = roleShare(dashboardRole);
  const acquisitionShare = roleShare([acquisition.name, acquisition.weight]);
  const projectManagement = roleShare([management.tasks[0], management.weight, management.extraWeight]);
  const teamAmount = teamShares.reduce((sum, role) => sum + role.amount, projectManagement.amount + acquisitionShare.amount);
  const teamTotal = { name: "جمع تیم اجرایی", amount: teamAmount, percentage: projectAmount ? (teamAmount / projectAmount) * 100 : 0 };
  const projectSupport = share("تجهیزات و ایاب‌وذهاب", baseAmount * 0.10);
  const romavaCore = share("سهم پایهٔ روماوا", baseAmount * 0.30, extraAmount * 0.70);
  const romava = share("سهم روماوا", romavaCore.baseShare + dashboard.baseShare, romavaCore.extraShare + dashboard.extraShare);
  return { projectAmount, baseAmount, extraAmount, extraTeamBudget, teamShares, taskShares: teamShares.flatMap(role => role.tasks), teamTotal, projectSupport, projectManagement, romava, romavaCore, dashboard, acquisitionShare,
    allocatedTotal: teamAmount + projectSupport.amount + romava.amount };
}

export function personalProjectShare(data, taskIndices, romavaPercent) {
  const taskAmount = taskIndices.reduce((sum, index) => sum + data.taskShares[index].amount, 0);
  const romavaAmount = data.romava.amount * (romavaPercent / 100);
  return { amount: taskAmount + romavaAmount, romavaAmount };
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
  const romavaRate = calculator.querySelector("#project-romava-rate");
  const romavaError = calculator.querySelector("#project-romava-error");
  const personalRomavaOutput = personal.querySelector("#project-personal-romava");
  const format = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
  let taskIndex = 0;
  for (const role of roles) {
    const direct = role.tasks.length === 1 && !role.automated;
    const group = document.createElement("details");
    const taskList = document.createElement("div");
    if (!direct) {
      group.open = true;
      const heading = document.createElement("summary");
      const title = document.createElement("strong");
      title.textContent = role.name;
      heading.append(title);
      const badge = document.createElement("span");
      badge.textContent = format.format(role.weight + (role.automated?.[1] ?? 0)) + "٪";
      heading.append(badge);
      group.append(heading);
      taskList.className = "project-role-tasks";
      group.append(taskList);
      choices.append(group);
    }

    const tasks = weightedTasks(role);
    if (role.automated) tasks.push(role.automated);
    for (const [task, weight] of tasks) {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.disabled = role.locked || role.weight === 0 || task === role.automated?.[0];
      if (!checkbox.disabled) checkbox.value = taskIndex++;
      const labelText = direct ? role.name : task;
      checkbox.setAttribute("aria-label", labelText);
      label.append(checkbox, labelText);
      if (weight > 0) {
        const badge = document.createElement("span");
        badge.className = "project-task-weight";
        badge.textContent = format.format(weight) + "٪";
        label.append(badge);
      }
      if (direct) {
        label.className = "project-direct-role";
        choices.append(label);
      } else {
        taskList.append(label);
      }
    }
  }
  const results = calculator.querySelector("#project-results");
  const table = results.querySelector("tbody");
  const cards = results.querySelector("#project-totals");
  const extra = results.querySelector("#project-extra");
  const money = amount => format.format(amount) + " تومان";
  const millions = amount => format.format(amount / 1_000_000);
  const rate = percentage => format.format(percentage) + "٪";
  const romavaDescription = "شامل هزینه‌های ماهانه، اجاره، سایت و اکانت منیجری با داشبورد";

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
    const romavaPercent = parseProjectAmount(romavaRate.value) ?? 0;
    const invalidRomava = !Number.isFinite(romavaPercent) || romavaPercent > 100;
    romavaError.hidden = !invalidRomava;
    romavaRate.setAttribute("aria-invalid", String(invalidRomava));
    results.hidden = !Number.isFinite(amount) || amount <= 0 || !validExchange;
    if (results.hidden) return;

    const data = calculateProjectShares(amount, exchangeRate);
    const selected = Array.from(choices.querySelectorAll("input:checked:not(:disabled)"));
    personal.hidden = invalidRomava || (selected.length === 0 && romavaPercent === 0);
    if (!personal.hidden) {
      const personalShare = personalProjectShare(data, selected.map(checkbox => Number(checkbox.value)), romavaPercent);
      personalAmountOutput.textContent = money(personalShare.amount);
      personalRateOutput.textContent = rate((personalShare.amount / amount) * 100) + " از کل پروژه";
      personalRomavaOutput.hidden = romavaPercent === 0;
      personalRomavaOutput.textContent = money(personalShare.romavaAmount) + " از سهم روماوا";
    }
    cards.innerHTML = [data.teamTotal, data.projectSupport, data.romava].map(row =>
      `<article><span>${row.name}</span><strong>${money(row.amount)}</strong><span>${rate(row.percentage)} از کل پروژه</span>${row === data.romava ? `<small>${romavaDescription}</small>` : ""}</article>`).join("");
    table.innerHTML = [...data.teamShares, data.projectManagement, data.acquisitionShare, data.teamTotal, data.projectSupport, data.romavaCore, data.dashboard].map(row =>
      `<tr${row === data.teamTotal ? ' class="team-total"' : ""}><th scope="row">${row.name}${row === data.dashboard ? " (در جمع کارت روماوا)" : ""}</th><td>${millions(row.amount)}</td><td>${rate(row.percentage)}</td></tr>`).join("");
    results.querySelector("tfoot td").textContent = millions(data.allocatedTotal);
    results.querySelector("tfoot tr td:last-child").textContent = rate(amount ? 100 : 0);
    extra.hidden = data.extraAmount === 0;
    extra.textContent = extra.hidden ? "" : `از ${money(data.extraAmount)} اضافه بر مرز ${money(data.baseAmount)}، ${money(data.extraTeamBudget - data.dashboard.extraShare)} به تیم اجرایی و ${money(data.romava.extraShare)} به روماوا می‌رسه. سهم داشبورد سایت داخل مبلغ روماواست.`;
  }

  plan.addEventListener("change", update);
  custom.addEventListener("input", update);
  exchange.addEventListener("input", update);
  choices.addEventListener("change", update);
  romavaRate.addEventListener("input", update);
  update();
}
