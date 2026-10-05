import { json, requireAdmin, getDb } from "../lib/util.js";

export async function onRequestGet(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare("SELECT id, name, email, message, created_at FROM messages ORDER BY created_at DESC LIMIT 200")
      .all();
    return json(results ?? []);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { name, email, message } = body ?? {};
    if (!name || !email || !message) {
      return json({ error: "Nama, email, dan pesan wajib diisi" }, 400);
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return json({ error: "Format email tidak valid" }, 400);
    const db = getDb(context);
    const result = await db
      .prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)")
      .bind(String(name).slice(0, 100), String(email).slice(0, 200), String(message).slice(0, 2000))
      .run();
    return json({ id: result.meta.last_row_id }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
