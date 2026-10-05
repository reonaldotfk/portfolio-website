import { json, requireAdmin, getDb } from "../../lib/util.js";

export async function onRequestDelete(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) return json({ error: "ID tidak valid" }, 400);
    const db = getDb(context);
    const result = await db.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) return json({ error: "Pesan tidak ditemukan" }, 404);
    return json({ ok: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
