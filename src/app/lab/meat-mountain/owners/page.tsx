"use client";
import Link from "next/link";
import { useState } from "react";
import type { LeagueOwner } from "@/lib/meat-mountain/owners";
import "../mountain.css";

export default function OwnerNames() {
  const [password, setPassword] = useState("");
  const [owners, setOwners] = useState<LeagueOwner[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function request(save = false) {
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/meat-mountain/owners", {
        method: save ? "PUT" : "GET", cache: "no-store",
        headers: { "x-admin-token": password, ...(save ? { "Content-Type": "application/json" } : {}) },
        ...(save ? { body: JSON.stringify(owners?.map(({ userId, name }) => ({ userId, name }))) } : {}),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Couldn’t connect. Try again.");
      if (save) setMessage("Names saved. League mates will see them on the next standings refresh.");
      else setOwners(result);
    } catch (error) {
      setError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Connection timed out. Try again.");
    } finally { setBusy(false); }
  }
  return <main className="mm-app mm-owner-admin">
    <Link href="/lab/meat-mountain" className="mm-lab-link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h14" /></svg>Back to the mountain</Link>
    <h1>Names on the mountain</h1>
    <p>Give each team a familiar owner name. Team names and avatars still come from Sleeper.</p>
    <form onSubmit={(event) => { event.preventDefault(); void request(!!owners); }}>
      {owners ? <>
        <div className="mm-owner-fields">
          {owners.map((owner, index) => <label key={owner.userId}>
            <span><b>{owner.team}</b><small>@{owner.username}</small></span>
            <input aria-label={`Owner name for ${owner.team}`} type="text" maxLength={40}
              autoComplete="off" placeholder={owner.username} value={owner.name}
              onChange={(event) => setOwners(owners.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} />
          </label>)}
        </div>
        <p className="mm-admin-hint">Leave a name blank to use their Sleeper username.</p>
      </> : <label className="mm-admin-password">Site admin password
        <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>}
      <div className="mm-admin-actions">
        <button type="submit" disabled={busy}>{busy ? owners ? "Saving…" : "Checking password…" : owners ? "Save names" : "Open owner editor"}</button>
        {owners && <button type="button" disabled={busy} onClick={() => { setOwners(null); setPassword(""); setMessage(""); setError(""); }}>Sign out</button>}
      </div>
      <p role="status" className={error ? "mm-admin-error" : "mm-admin-message"}>{error || message}</p>
    </form>
  </main>;
}
