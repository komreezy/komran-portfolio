const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
function load(file) {
 const m = new Module(file);
 m.require = (id) => id.startsWith('./') ? load(path.resolve(path.dirname(file), id + '.ts')) : require(id);
 m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
 }).outputText, file);
 return m.exports;
}
const { loadRace } = load(path.resolve('src/lib/meat-mountain/data.ts'));
let points = 10;
const calls = [];
global.fetch = async (url, options) => {
 calls.push({url,options});
 let body;
 if (url.endsWith('/state/nfl')) body = { week: 3, season: '2026' };
 else if (url.endsWith('/users')) body = [{user_id:'123456789012',display_name:'owner',metadata:{team_name:'Team'}}];
 else if (url.endsWith('/rosters')) body = [{ roster_id: 1, owner_id: '123456789012' }];
 else if (url.includes('/matchups/')) body = [{ roster_id: 1, points, starters: [] }];
 else if (url.includes('/league/')) body = { name:'Test', season:'2026', scoring_settings:{} };
 else if (url.includes('scoreboard')) body = { events: [] };
 else body = [];
 return {ok:true,json:async()=>body};
};
(async()=>{
 const first = await loadRace(undefined,true);
 assert.equal(first.teams[0].actual,10);
 const live = calls.filter(c=>c.url.includes('/matchups/') || c.url.includes('/state/') || c.url.includes('/rosters') || c.url.includes('/projections/') || c.url.includes('/schedule/') || c.url.includes('scoreboard'));
 assert.equal(live.length,6);
 live.forEach(c=>assert.equal(c.options.cache,'no-store',c.url));
 const metadata=calls.filter(c=>c.url.endsWith('/users')||/\/league\/\d+$/.test(c.url));
 assert.equal(metadata.length,2);
 metadata.forEach(c=>assert.equal(c.options.next.revalidate,3600));
 calls.filter(c=>c.url.includes('/stats/')).forEach(c=>assert.equal(c.options.next.revalidate,86400));
 points=20;
 const second=await loadRace(undefined,true);
 assert.equal(second.teams[0].actual,20,'Explicit refresh reads changed upstream scores');
 assert.equal(second.teams[0].ownerId,'123456789012');
 console.log('Fresh score/clock/projection reads, hourly owner metadata, daily variance cache and upstream score changes passed.');
})().catch(error=>{console.error(error);process.exit(1)});
