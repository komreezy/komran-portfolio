import { createClient } from "@supabase/supabase-js";
import type { TortalonaDocument } from "./types";

function client(write = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function readTortalonaDocument(): Promise<TortalonaDocument> {
  const db = client();
  if (!db) throw new Error("Tortalona storage is not configured.");
  const { data, error } = await db.from("tortalona_document").select("revision,seasons").eq("id", 1).single();
  if (error || !data) throw new Error("Tortalona data is unavailable.");
  return { revision: data.revision, seasons: data.seasons as TortalonaDocument["seasons"] };
}

export async function writeTortalonaDocument(document: TortalonaDocument): Promise<TortalonaDocument | null> {
  const db = client(true);
  if (!db) throw new Error("Tortalona storage is not configured.");
  const nextRevision = document.revision + 1;
  const { data, error } = await db.from("tortalona_document")
    .update({ revision: nextRevision, seasons: document.seasons, updated_at: new Date().toISOString() })
    .eq("id", 1).eq("revision", document.revision).select("revision,seasons").maybeSingle();
  if (error) throw new Error("Tortalona data could not be saved.");
  if (!data) return null;
  return { revision: data.revision, seasons: data.seasons as TortalonaDocument["seasons"] };
}
