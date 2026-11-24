import assert from "node:assert/strict";
import { calculateProjectShares as calculate, parseProjectAmount as parse, personalProjectShare } from "../public/project-shares.mjs";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001);
for (const [amount, team, support, romava] of [[0,0,0,0],[100,60,10,30],[200,120,20,60],[400,180,20,200],[500,210,20,270]]) {
  const result = calculate(amount);
  close(result.teamTotal.amount, team);
  close(result.projectSupport.amount, support);
  close(result.romava.amount, romava);
  close(result.allocatedTotal, amount);
  for (const row of [...result.teamShares, result.teamTotal, result.projectSupport, result.projectManagement, result.romava, result.dashboard]) {
    close(row.percentage, amount ? (row.amount / amount) * 100 : 0);
  }
}
close(calculate(500).romava.percentage, 54);
close(calculate(500).extraTeamBudget, 90);
close(calculate(500).romava.extraShare, 210);
assert.equal(parse("۵۰۰٫۲۵"), 500.25);
assert.equal(parse("٤٠٠"), 400);
assert.equal(parse("1,000.00"), 1000);
assert.equal(parse(" "), null);
for (const invalid of ["-50", "ناشناس", "۵۰۰x", "Infinity"]) assert.ok(Number.isNaN(parse(invalid)));
for (const invalid of [NaN, -1, Infinity, "200"]) assert.throws(() => calculate(invalid));
console.log("PASS project shares, five sample amounts, decimal precision and invalid input");
const toman = calculate(parse("۵۰", 1_000_000), parse("۱۰۰", 1_000));
close(toman.baseAmount, 20_000_000);
close(toman.teamTotal.amount, 21_000_000);
close(toman.projectSupport.amount, 2_000_000);
close(toman.romava.amount, 27_000_000);
for (const invalidRate of [0, -1, NaN, Infinity]) assert.throws(() => calculate(1000, invalidRate));
assert.equal(parse("۱۲٫۵", 1_000_000), 12_500_000);
assert.equal(parse("۱۰۲٫۵", 1_000), 102_500);
close(calculate(100).taskShares.find(task => task.name === "هماهنگی و انتشار").amount, 2);
close(calculate(100).dashboard.amount, 0.5);
close(calculate(500).dashboard.amount, 1+45/55);
close(calculate(500).taskShares.find(task => task.name === "هماهنگی و انتشار").amount, 4*calculate(500).dashboard.amount);
close(calculate(100).romavaCore.percentage, 30);
close(calculate(100).romava.percentage, 30);
close(calculate(500).romavaCore.amount, 270);
const base = calculate(100);
const expectedRoles = [
  ["کاوشگر (دیسکاوری)", 10], ["نویسنده و آنالیزور", 15], ["کارگردان", 10],
  ["تصویرگر (ادیتور)", 15], ["آچار فرانسه", 5.5],
];
assert.deepEqual(base.teamShares.map(role => role.name), expectedRoles.map(([name]) => name));
expectedRoles.forEach(([, amount], index) => close(base.teamShares[index].amount, amount));
const expectedTasks = [
  ["دیسکاوری", 10], ["اسکریپت", 14], ["آنالیز", 1], ["دکوپاژ", 3.5],
  ["آفیش کارگردانی", 4.5], ["هماهنگی و انتشار", 2], ["ادیت", 15], ["آفیش کمک", 2.5],
  ["استوریست", 2.5],
];
assert.deepEqual(base.taskShares.map(task => task.name), expectedTasks.map(([name]) => name));
expectedTasks.forEach(([, amount], index) => close(base.taskShares[index].amount, amount));
const extra = calculate(500);
close(extra.taskShares.find(task => task.name === "آفیش کمک").extraShare, 90 * 2.5 / 55);
close(extra.taskShares.find(task => task.name === "ادیت").extraShare, 90 * 12.5 / 55);
for (const amount of [100, 500]) {
  for (const role of calculate(amount).teamShares) {
    close(role.tasks.reduce((sum, task) => sum + task.amount, 0), role.amount - (role.name === "آچار فرانسه" ? calculate(amount).dashboard.amount : 0));
  }
}
close(base.projectManagement.amount, 2.5);
close(calculate(500).projectManagement.extraShare, 0);
close(base.acquisitionShare.amount, 2);
close(extra.acquisitionShare.extraShare, 90 * 2 / 55);
assert.ok(!base.taskShares.some(task => task.name === "جذب"));
close(base.teamTotal.amount, base.teamShares.reduce((total, role) => total + role.amount, base.projectManagement.amount + base.acquisitionShare.amount));
const personalBase = calculate(45_000_000, 270_000);
close(personalProjectShare(personalBase, [], 10).amount, 1_350_000);
const chosen = personalBase.taskShares.findIndex(task => task.name === "دکوپاژ");
close(personalProjectShare(personalBase, [chosen], 10).amount, 2_925_000);
close(personalProjectShare(personalBase, [chosen], 0).amount, 1_575_000);
close(personalProjectShare(personalBase, [], 100).amount, personalBase.romava.amount);
assert.ok(!base.taskShares.some(task => task.name === "گزارش سیستمی"));
