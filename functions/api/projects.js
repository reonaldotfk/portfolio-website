import { json, requireAdmin, getDb } from "../lib/util.js";

export async function onRequestGet(context) {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare("SELECT id, title, description, tech, url, image, created_at FROM projects ORDER BY created_at DESC")
      .all();
    return json(results ?? []);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const body = await context.request.json();
    const { title, description = "", tech = "", url = "", image = "" } = body ?? {};
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return json({ error: "title wajib diisi" }, 400);
    }
    const db = getDb(context);
    const result = await db
      .prepare("INSERT INTO projects (title, description, tech, url, image) VALUES (?, ?, ?, ?, ?)")
      .bind(title.trim().slice(0, 200), description.slice(0, 2000), tech.slice(0, 200), url.slice(0, 500), image.slice(0, 500))
      .run();
    return json({ id: result.meta.last_row_id }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
