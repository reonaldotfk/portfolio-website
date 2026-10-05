import { json, requireAdmin, getDb } from "../../lib/util.js";

export async function onRequestPut(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) return json({ error: "ID tidak valid" }, 400);
    const body = await context.request.json();
    const { title, description = "", tech = "", url = "", image = "" } = body ?? {};
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return json({ error: "title wajib diisi" }, 400);
    }
    const db = getDb(context);
    const result = await db
      .prepare("UPDATE projects SET title = ?, description = ?, tech = ?, url = ?, image = ? WHERE id = ?")
      .bind(title.trim().slice(0, 200), description.slice(0, 2000), tech.slice(0, 200), url.slice(0, 500), image.slice(0, 500), id)
      .run();
    if (result.meta.changes === 0) return json({ error: "Proyek tidak ditemukan" }, 404);
    return json({ ok: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) return json({ error: "ID tidak valid" }, 400);
    const db = getDb(context);
    const result = await db.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) return json({ error: "Proyek tidak ditemukan" }, 404);
    return json({ ok: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
