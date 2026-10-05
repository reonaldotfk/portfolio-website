import { json, requireAdmin, getBucket } from "../lib/util.js";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function onRequestPost(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  try {
    const bucket = getBucket(context);
    const form = await context.request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "File tidak ditemukan (field 'file')" }, 400);
    }
    if (file.size === 0) return json({ error: "File kosong" }, 400);
    if (file.size > MAX_SIZE) return json({ error: "Ukuran file maksimal 10 MB" }, 400);

    const safeName = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
    const key = `uploads/${crypto.randomUUID()}-${safeName}`;

    await bucket.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    return json({ key, url: `/api/files/${key}` }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
