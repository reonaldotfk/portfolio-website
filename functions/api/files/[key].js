import { json, getBucket } from "../../lib/util.js";

export async function onRequestGet(context) {
  try {
    const bucket = getBucket(context);
    const key = decodeURIComponent(context.params.key);
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
