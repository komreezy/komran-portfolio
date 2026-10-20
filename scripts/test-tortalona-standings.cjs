const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');

const source = fs.readFileSync('src/lib/tortalona/standings.ts', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const sandboxModule = { exports: {} };
vm.runInNewContext(compiled, { module: sandboxModule, exports: sandboxModule.exports });
const { getScoringTable } = sandboxModule.exports;

const season = (id, players, games = []) => ({
  id,
  name: id,
  baselineGame: 5,
  totalGames: 9,
  players,
  games,
});

const newest = season('newest', [
  { id: 'p1', name: 'Zoë New Name', baselineGoals: 4 },
  { id: 'p2', name: 'Same Name', baselineGoals: 0 },
  { id: 'p4', name: 'Aaron', baselineGoals: 0 },
], [
  { week: 6, goals: { p1: 2, p2: 3, p4: 0 } },
]);
const older = season('older', [
  { id: 'p1', name: 'Zoe', baselineGoals: 2 },
  { id: 'p2', name: 'Same Name', baselineGoals: 1 },
], [
  { week: 6, goals: { p1: 1, p2: 2 } },
  { week: 7, goals: { p1: 3 } },
]);
const oldest = season('oldest', [
  { id: 'p3', name: 'Same Name', baselineGoals: 1 },
], [
  { week: 6, goals: {} },
  { week: 7, goals: { p3: 1 } },
]);

assert.deepEqual(JSON.parse(JSON.stringify(getScoringTable([newest, older, oldest]))), [
  { id: 'p1', name: 'Zoë New Name', goals: 12 },
  { id: 'p2', name: 'Same Name', goals: 6 },
  { id: 'p3', name: 'Same Name', goals: 2 },
  { id: 'p4', name: 'Aaron', goals: 0 },
]);
assert.deepEqual(JSON.parse(JSON.stringify(getScoringTable([newest]))), [
  { id: 'p1', name: 'Zoë New Name', goals: 6 },
  { id: 'p2', name: 'Same Name', goals: 3 },
  { id: 'p4', name: 'Aaron', goals: 0 },
]);

const tied = getScoringTable([season('ties', [
  { id: 'z', name: 'Zelda', baselineGoals: 2 },
  { id: 'b', name: 'Beta', baselineGoals: 2 },
  { id: 'a', name: 'Alpha', baselineGoals: 2 },
], [
  { week: 6, goals: { z: 0, b: 0, a: 0 } },
])]);
assert.deepEqual(JSON.parse(JSON.stringify(tied)), [
  { id: 'a', name: 'Alpha', goals: 2 },
  { id: 'b', name: 'Beta', goals: 2 },
  { id: 'z', name: 'Zelda', goals: 2 },
]);
assert.deepEqual(JSON.parse(JSON.stringify(getScoringTable([]))), []);
assert.deepEqual(JSON.parse(JSON.stringify(getScoringTable([season('empty', [])]))), []);

console.log('Tortalona scoring table checks passed.');
