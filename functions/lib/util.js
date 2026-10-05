// Utilitas bersama untuk Pages Functions.
export function json(data, status = 200) {
  return Response.json(data, { status });
}

export function requireAdmin(context) {
  const token = context.request.headers.get("x-admin-token");
  if (!context.env.ADMIN_TOKEN || token !== context.env.ADMIN_TOKEN) {
    return json({ error: "Tidak diotorisasi" }, 401);
  }
  return null;
}

export function getDb(context) {
  if (!context.env.DB) throw new Error("Binding D1 (DB) belum dikonfigurasi");
  return context.env.DB;
}

export function getBucket(context) {
  if (!context.env.ASSETS) throw new Error("Binding R2 (ASSETS) belum dikonfigurasi");
  return context.env.ASSETS;
}
