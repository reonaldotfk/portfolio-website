import { json, getBucket } from "../../lib/util.js";

export async function onRequestGet(context) {
  try {
    const bucket = getBucket(context);
    const rawParts = context.params.key;
    // Catch-all [[key]] memberi array segmen path, bukan string.
    const raw = Array.isArray(rawParts) ? rawParts.join("/") : rawParts;
    if (!raw) return json({ error: "Key tidak valid" }, 400);
    const key = decodeURIComponent(raw);
    if (!key.startsWith("uploads/") || key.includes("..")) {
      return json({ error: "Key tidak valid" }, 400);
    }
    const obj = await bucket.get(key);
    if (!obj) return json({ error: "File tidak ditemukan" }, 404);

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set("etag", obj.httpEtag);
    headers.set("Cache-Control", "public, max-age=86400");
    return new Response(obj.body, { headers });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
