"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { TortalonaDocument, Season } from "@/lib/tortalona/types";
import { getScoringTable } from "@/lib/tortalona/standings";
import "./tortalona.css";

function Flourish() {
  return <svg className="tt-flourish" viewBox="0 0 72 20" fill="none" aria-hidden="true"><path d="M0 10h24m24 0h24M36 2l6 8-6 8-6-8 6-8ZM22 10l4-3 4 3-4 3-4-3Zm20 0 4-3 4 3-4 3-4-3Z" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

export default function Tortalona({ previewData }: { previewData?: TortalonaDocument }) {
  const [data, setData] = useState<TortalonaDocument | null>(previewData || null);
  const [draft, setDraft] = useState<TortalonaDocument | null>(null);
  const [seasonId, setSeasonId] = useState("");
  const [allTime, setAllTime] = useState(false);
  const [view, setView] = useState("table");
  const [week, setWeek] = useState(5);
  const [editor, setEditor] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function load(admin = false) {
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await fetch(`/api/tortalona${admin ? "?admin=1" : ""}`, { cache: "no-store", headers: admin ? { "x-admin-token": password } : {}, signal: AbortSignal.timeout(20000) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Couldn’t load the scoring table.");
      setData(result); if (admin) { setDraft(structuredClone(result)); const current = result.seasons.find((s: Season) => s.id === seasonId) || result.seasons[0]; setWeek(current.baselineGame || 1); }
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t connect. Please try again."); }
    finally { setBusy(false); }
  }
  // The initial load deliberately excludes the password used by the explicit admin action.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!previewData) void load(); }, []);
  useEffect(() => {
    if (!draft || JSON.stringify(draft) === JSON.stringify(data)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft, data]);
  const source = draft || data;
  const season = source?.seasons.find(s => s.id === seasonId) || source?.seasons[0];
  const games = season ? [...season.games].sort((a,b) => a.week-b.week) : [];
  const played = (season?.baselineGame || 0) + games.length;
  const ranked = getScoringTable(allTime ? source?.seasons || [] : season ? [season] : []);
  const total = ranked.reduce((n,p) => n+p.goals,0);
  const recordedGames = source?.seasons.reduce((n,s) => n+s.baselineGame+s.games.length,0) || 0;
  function update(next: Season) { if (draft) { setDraft({ ...draft, seasons: draft.seasons.map(s => s.id === next.id ? next : s) }); setMessage(""); } }
  async function save() {
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await fetch("/api/tortalona", { method:"PUT", headers:{"Content-Type":"application/json","x-admin-token":password}, body: JSON.stringify(draft), signal:AbortSignal.timeout(20000) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Couldn’t save. Your edits are still here.");
      setData(result); setDraft(structuredClone(result)); setMessage("Saved. The public scoring table is up to date.");
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t save. Your edits are still here."); }
    finally { setBusy(false); }
  }
  function closeEditor() {
    if (draft && JSON.stringify(draft) !== JSON.stringify(data) && !window.confirm("Discard your unsaved changes?")) return;
    setDraft(null); setEditor(false); setPassword(""); setError(""); setMessage("");
  }
  return <main className="tt-app"><div className="tt-sheet">
    <div className="tt-frame" aria-hidden="true" />
    <div className="tt-curtains" aria-hidden="true" />
    <div className="tt-top"><Link href="/lab">← Back to Lab</Link>{previewData ? <Link href="/lab/tortalona">Live club record →</Link> : <button onClick={() => { if (editor) closeEditor(); else { setAllTime(false); setView("table"); setEditor(true); } }}>{editor ? "Close editor" : "Club admin"}</button>}</div>
    <header className="tt-masthead">
      <Image className="tt-crest" src="/lab/tortalona/crest.png" alt="FC Tortalona crest" width={108} height={137} sizes="(max-width: 600px) 54px, (max-width: 1000px) 90px, 128px" preload />
      <h1><span>FC</span> Tortalona</h1>
      <p lang="es">Pasión, Pan, y Pelota</p>
      <div className="tt-masthead-rule"><Flourish /></div>
    </header>
    {editor && <section className="tt-editor" aria-label="Club editor"><h2>From the touchline</h2><p>Add your players and enter the goals. Changes go live when you save.</p>{!draft ? <form onSubmit={e=>{e.preventDefault(); void load(true);}}><label>Site admin password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} /></label><button disabled={busy} className="tt-primary">{busy ? "Opening…" : "Open club editor"}</button></form> : season && <>
      <fieldset disabled={busy}><div className="tt-edit-controls"><label>Season name<input maxLength={60} value={season.name} onChange={e=>update({...season,name:e.target.value})}/></label><label>Editing<select value={week <= season.baselineGame ? "baseline" : week} onChange={e=>setWeek(e.target.value === "baseline" ? season.baselineGame : Number(e.target.value))}>{season.baselineGame > 0 && <option value="baseline">Totals through game {season.baselineGame}</option>}{Array.from({length:season.totalGames-season.baselineGame},(_,i)=>i+season.baselineGame+1).map(w=><option key={w} value={w}>Game {w}</option>)}</select></label></div>
      <p className="tt-hint">{week <= season.baselineGame ? `Enter each player’s combined goals from games 1–${season.baselineGame}.` : `Enter goals scored in game ${week} only. Zero means the player didn’t score.`}</p>
      {week > season.baselineGame && <label className="tt-check"><input type="checkbox" checked={!!season.games.find(g=>g.week===week)} onChange={e=>update({...season,games:e.target.checked ? [...season.games,{week,goals:{}}] : season.games.filter(g=>g.week!==week)})}/> Game {week} played — include in season record</label>}
      <div className="tt-player-fields">{season.players.map(p=><div key={p.id}><label>Player name<input aria-label={`Name for ${p.name || "new player"}`} maxLength={40} value={p.name} onChange={e=>update({...season,players:season.players.map(v=>v.id===p.id?{...v,name:e.target.value}:v)})}/></label><label>Goals<input type="number" min="0" max="999" step="1" aria-label={`Goals for ${p.name || "new player"}`} disabled={week>season.baselineGame&&!season.games.some(g=>g.week===week)} value={week<=season.baselineGame?p.baselineGoals:season.games.find(g=>g.week===week)?.goals[p.id]||0} onChange={e=>{const n=Number(e.target.value); if(week<=season.baselineGame) update({...season,players:season.players.map(v=>v.id===p.id?{...v,baselineGoals:n}:v)}); else update({...season,games:season.games.map(g=>g.week===week?{...g,goals:{...g.goals,[p.id]:n}}:g)});}}/></label></div>)}</div>
      <button className="tt-outline" onClick={()=>update({...season,players:[...season.players,{id:crypto.randomUUID(),name:"",baselineGoals:0}]})}>+ Add player</button>
      <div className="tt-admin-actions"><button className="tt-primary" onClick={()=>void save()}>Save changes</button><button className="tt-outline" onClick={()=>{if(window.confirm("Discard unsaved edits and reload the latest saved record?")) void load(true);}}>Reload saved record</button><button className="tt-outline" onClick={()=>{if(window.confirm("Start a new nine-game season? Your existing seasons will remain available.")){const id=crypto.randomUUID();setDraft({...draft,seasons:[{id,name:"New season",baselineGame:0,totalGames:9,players:season.players.map(p=>({...p,baselineGoals:0})),games:[]},...draft.seasons]});setSeasonId(id);setWeek(1);}}}>Start next season</button></div></fieldset><p className="tt-hint">You’re viewing your draft. Close the editor to return to the saved table.</p></> }</section>}
    {error && <div className="tt-alert" role="alert">{error} {!draft && <button onClick={()=>void load(editor)}>Try again</button>}</div>}<p className="tt-status" role="status">{message}</p>
    <div className="tt-record">
      <div className="tt-record-nav">
        <div className="tt-tabs" aria-label="Club record view">
          <button aria-pressed={view==="table"} onClick={()=>setView("table")}>Goalscorers</button>
          <button aria-pressed={view==="history"} onClick={()=>setView("history")}>Team history</button>
        </div>
        {view === "table" && <div className="tt-edition">{season && <select aria-label="Season" value={allTime ? "all-time" : season.id} onChange={e => {
          const lifetime = e.target.value === "all-time";
          setAllTime(lifetime);
          if (!lifetime) { setSeasonId(e.target.value); setWeek(source?.seasons.find(s=>s.id===e.target.value)?.baselineGame || 1); }
        }}>{source?.seasons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}{!editor && <option value="all-time">All time</option>}</select>}</div>}
      </div>
      {view === "history" ? <section className="tt-team-history" aria-label="Team history" /> : <div className="tt-content">
        <section className="tt-main" aria-label={allTime ? "All-time scoring table" : "Scoring table"}>
          {!data ? <div className="tt-empty"><h3>{busy ? "Opening the club record…" : "The record is unavailable."}</h3><p>{busy ? "Fetching the latest goals and games." : "Try again to load the latest scoring table."}</p></div> : !ranked.length ? <div className="tt-empty"><span className="tt-empty-number">—</span><h3>A new page in the club record.</h3><p>Add the squad and their goals in Club admin to open the scoring table.</p></div> : <table className="tt-table">
            <thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Goals</th></tr></thead>
            <tbody>{ranked.map(p => {
              const rank = ranked.findIndex(v=>v.goals===p.goals)+1;
              return <tr key={p.id} className={p.goals>0&&p.goals===ranked[0].goals?"tt-leader":""}><td>{String(rank).padStart(2,"0")}</td><th scope="row"><span className="tt-player-name">{p.name}</span></th><td><span className="tt-goal-value">{p.goals}</span></td></tr>;
            })}</tbody>
          </table>}
          {data && <p className="tt-footnote">{allTime ? "Totals across all recorded seasons." : season?.baselineGame ? `Includes opening totals through game ${season.baselineGame} and each game recorded since.` : "Goals are recorded one game at a time."}</p>}
        </section>
        <aside className="tt-sidebar">
          <h2><Flourish />{allTime ? "Club overview" : "Season overview"}</h2>
          <div className="tt-total"><strong>{data&&ranked.length?total:"—"}</strong><span>team<br/>goals</span></div>
          {allTime ? <ul className="tt-ledger"><li><span>Seasons recorded</span><strong>{source?.seasons.length || 0}</strong></li><li><span>Games recorded</span><strong>{recordedGames}</strong></li></ul> : <>
            <div className="tt-progress-heading"><span>Season progress</span><strong>{season ? played : "—"}<span> / {season?.totalGames || 9}</span></strong></div>
            <ol className="tt-season-strip" aria-label="Season progress">{Array.from({length:season?.totalGames||9},(_,i)=>i+1).map(w=>{const recorded=w<=(season?.baselineGame||0)||games.some(g=>g.week===w);const latest=Math.max(season?.baselineGame||0,...games.map(g=>g.week));return <li key={w} className={`${recorded?"played":""} ${w===latest?"current":""}`} title={`Game ${w}: ${recorded?"recorded":"not recorded"}`}><span className="tt-dot" aria-hidden="true"/><span className="tt-sr-only">Game {w}: {recorded?"recorded":"not recorded"}</span></li>;})}</ol>
            <p className="tt-hint">{season ? `${played} recorded · ${season.totalGames-played} remaining` : "Awaiting season record"}</p>
            <h3><Flourish />Match record</h3>{games.length? <ul className="tt-ledger">{games.map(g=><li key={g.week}><span>Game {g.week}</span><strong>{Object.values(g.goals).reduce((a,b)=>a+b,0)} goals</strong></li>)}</ul>:<p className="tt-hint">Game {(season?.baselineGame||0)+1} is next. Its goals will appear here once recorded.</p>}
          </>}
        </aside>
      </div>}
    </div>
    <footer className="tt-footer"><span>{previewData ? "Design preview · Sample names and goals" : "FC Tortalona · The club record"}</span><Link href="/lab">A Komran Lab project ↗</Link></footer>
  </div></main>;
}
