const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');

const source = fs.readFileSync('src/lib/tortalona/validation.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const sandboxModule = { exports: {} };
vm.runInNewContext(compiled, { module: sandboxModule, exports: sandboxModule.exports });
const { validateTortalonaDocument } = sandboxModule.exports;

const valid = {
  revision: 0,
  seasons: [{ id: 'current', name: 'Current season', baselineGame: 5, totalGames: 9,
    players: [{ id: 'p1', name: 'Player One', baselineGoals: 2 }],
    games: [{ week: 6, goals: { p1: 1 } }, { week: 9, goals: {} }] }],
};
assert.deepEqual(JSON.parse(JSON.stringify(validateTortalonaDocument(valid).value)), valid);
const newSeason = { revision: 0, seasons: [{ id: 'next', name: 'Next season', baselineGame: 0, totalGames: 9,
  players: [{ id: 'p1', name: 'Player One', baselineGoals: 0 }], games: [] }] };
assert.deepEqual(JSON.parse(JSON.stringify(validateTortalonaDocument(newSeason).value)), newSeason);
assert.match(validateTortalonaDocument({ ...newSeason, seasons: [{ ...newSeason.seasons[0], players: [{ id: 'p1', name: 'Player One', baselineGoals: 1 }] }] }).error, /zero baseline/);
assert.match(validateTortalonaDocument({ ...valid, revision: -1 }).error, /revision/);
assert.match(validateTortalonaDocument({ ...valid, seasons: [{ ...valid.seasons[0], totalGames: 10 }] }).error, /game range/);
assert.match(validateTortalonaDocument({ ...valid, seasons: [{ ...valid.seasons[0], games: [{ week: 5, goals: {} }] }] }).error, /Games/);
assert.match(validateTortalonaDocument({ ...valid, seasons: [{ ...valid.seasons[0], games: [{ week: 6, goals: { stranger: 1 } }] }] }).error, /Games/);
assert.match(validateTortalonaDocument({ ...valid, seasons: [{ ...valid.seasons[0], players: [valid.seasons[0].players[0], valid.seasons[0].players[0]] }] }).error, /unique/);
assert.match(validateTortalonaDocument({ ...valid, seasons: [{ ...valid.seasons[0], games: [{ week: 6, goals: { p1: 1001 } }] }] }).error, /Games/);
console.log('Tortalona document validation checks passed.');
