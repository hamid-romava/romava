import assert from "node:assert/strict";
import { calculateProjectShares as calculate, parseProjectAmount as parse } from "../public/project-shares.mjs";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001);
for (const [amount, team, support, romava] of [[0,0,0,0],[100,54.5,10,35.5],[200,109,20,71],[400,169-30/55,20,211+30/55],[500,199-45/55,20,281+45/55]]) {
  const result = calculate(amount);
  close(result.teamTotal.amount, team);
  close(result.projectSupport.amount, support);
  close(result.romava.amount, romava);
  close(result.allocatedTotal, amount);
  for (const row of [...result.teamShares, result.teamTotal, result.projectSupport, result.romava, result.dashboard]) {
    close(row.percentage, amount ? (row.amount / amount) * 100 : 0);
  }
}
assert.deepEqual(calculate(400).teamShares.map(row => row.amount.toFixed(2)), ["30.91","30.91","46.36","46.36","6.18","7.73"]);
assert.deepEqual(calculate(500).teamShares.map(row => row.amount.toFixed(2)), ["36.36","36.36","54.55","54.55","7.27","9.09"]);
close(calculate(500).romava.percentage, (281+45/55)/5);
close(calculate(500).extraTeamBudget, 90);
close(calculate(500).romava.extraShare, 210+45/55);
assert.equal(parse("۵۰۰٫۲۵"), 500.25);
assert.equal(parse("٤٠٠"), 400);
assert.equal(parse("1,000.00"), 1000);
assert.equal(parse(" "), null);
for (const invalid of ["-50", "ناشناس", "۵۰۰x", "Infinity"]) assert.ok(Number.isNaN(parse(invalid)));
for (const invalid of [NaN, -1, Infinity, "200"]) assert.throws(() => calculate(invalid));
console.log("PASS project shares, five sample amounts, decimal precision and invalid input");
const toman = calculate(parse("۵۰", 1_000_000), parse("۱۰۰", 1_000));
close(toman.baseAmount, 20_000_000);
close(toman.teamTotal.amount, 19_900_000-4_500_000/55);
close(toman.projectSupport.amount, 2_000_000);
close(toman.romava.amount, 28_100_000+4_500_000/55);
close(toman.teamShares[0].amount + toman.teamShares[3].amount, 100_000_000 / 11);
for (const invalidRate of [0, -1, NaN, Infinity]) assert.throws(() => calculate(1000, invalidRate));
assert.equal(parse("۱۲٫۵", 1_000_000), 12_500_000);
assert.equal(parse("۱۰۲٫۵", 1_000), 102_500);
close(calculate(100).teamShares[4].amount, 2);
close(calculate(100).dashboard.amount, 0.5);
close(calculate(500).dashboard.amount, 1+45/55);
close(calculate(500).teamShares[4].amount, 4*calculate(500).dashboard.amount);
close(calculate(100).romavaCore.percentage, 35);
close(calculate(100).romava.percentage, 35.5);
close(calculate(500).romavaCore.amount, 280);
