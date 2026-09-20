const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
const compiled = ts.transpileModule(
  fs.readFileSync("src/lib/meat-mountain/model.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
const m = new Module("meat-model");
m._compile(compiled, "meat-model.js");
const { forecast, score, probabilities, playerSigma, compareHigh, compareLow } =
  m.exports;
assert.equal(forecast(0, 20, 0, "QB"), 20);
assert.equal(forecast(31.24, 20, 1, "QB"), 31.24);
assert.ok(forecast(20, 10, 0.1, "RB") < 31, "Early spike stays tempered");
assert.ok(forecast(10, 6, 0.5, "DEF") < 13, "Defense can give back points");
assert.equal(
  score(
    { pass_yd: 250, pass_td: 2, pass_int: 1 },
    { pass_yd: 0.04, pass_td: 4, pass_int: -2 },
  ),
  16,
);
assert.equal(playerSigma("RB", [], 1), 0);
assert.ok(playerSigma("RB", [], 0) > 0);
const team = (id, actual, pa) => ({
  id,
  actual,
  projected: actual,
  pointsAgainst: pa,
  players: [],
  high: 0,
  low: 0,
});
const lowPA = team(1, 100, 80),
  highPA = team(2, 100, 120);
assert.ok(compareHigh(lowPA, highPA) < 0);
assert.ok(compareLow(highPA, lowPA) < 0);
const settled = probabilities([lowPA, highPA]);
assert.ok(Math.abs(settled.find((t) => t.id === 1).high - 1) < 1e-9);
assert.ok(Math.abs(settled.find((t) => t.id === 2).low - 1) < 1e-9);
const tied = probabilities([team(1, 100, 80), team(2, 100, 80)]);
assert.ok(Math.abs(tied[0].high - 0.5) < 1e-9);
const precise = probabilities([team(1, 100.01, 100), team(2, 100.02, 200)]);
assert.ok(precise.find((t) => t.id === 2).high > 0.999);
const uncertain = [team(1, 100, 80), team(2, 90, 120)].map((t) => ({
  ...t,
  players: [{ sigma: 10, projected: 30, position: "RB", game: "same" }],
}));
const sim = probabilities(uncertain);
assert.ok(Math.abs(sim.reduce((s, t) => s + t.high, 0) - 1) < 1e-9);
assert.ok(Math.abs(sim.reduce((s, t) => s + t.low, 0) - 1) < 1e-9);
console.log(
  "Model checks passed: scoring, tempered pacing, defense, variance, ties, precision, probability conservation.",
);
