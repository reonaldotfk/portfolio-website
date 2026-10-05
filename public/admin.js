let token = sessionStorage.getItem("admin_token") || "";

const loginBox = document.getElementById("login-box");
const panel = document.getElementById("panel");

function authHeaders(extra = {}) {
  return { "x-admin-token": token, ...extra };
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function tryEnter() {
  if (!token) return;
  const res = await fetch("/api/messages", { headers: authHeaders() });
  if (res.ok) {
    loginBox.style.display = "none";
    panel.style.display = "block";
    loadMessages();
    loadProjects();
  } else {
    token = "";
    sessionStorage.removeItem("admin_token");
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  token = document.getElementById("token").value.trim();
  sessionStorage.setItem("admin_token", token);
  await tryEnter();
});

// --- Pesan ---
async function loadMessages() {
  const box = document.getElementById("messages");
  try {
    const res = await fetch("/api/messages", { headers: authHeaders() });
    const msgs = await res.json();
    if (!msgs.length) { box.innerHTML = '<p class="muted">Belum ada pesan.</p>'; return; }
    box.innerHTML = `<table><thead><tr><th>Nama</th><th>Email</th><th>Pesan</th><th>Tanggal</th><th></th></tr></thead><tbody>` +
      msgs.map(m => `<tr>
        <td>${escapeHtml(m.name)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td>${escapeHtml(m.message)}</td>
        <td>${escapeHtml(m.created_at)}</td>
        <td><button class="btn btn-danger" data-del="${m.id}">Hapus</button></td>
      </tr>`).join("") + `</tbody></table>`;
    box.querySelectorAll("[data-del]").forEach(b =>
      b.addEventListener("click", async () => {
        if (!confirm("Hapus pesan ini?")) return;
        await fetch(`/api/messages/${b.dataset.del}`, { method: "DELETE", headers: authHeaders() });
        loadMessages();
      }));
  } catch { box.innerHTML = '<p class="muted">Gagal memuat pesan.</p>'; }
}

// --- Proyek ---
async function loadProjects() {
  const box = document.getElementById("project-list");
  try {
    const res = await fetch("/api/projects");
    const projects = await res.json();
    if (!projects.length) { box.innerHTML = '<p class="muted">Belum ada proyek.</p>'; return; }
    box.innerHTML = `<table><thead><tr><th>Judul</th><th>Teknologi</th><th></th></tr></thead><tbody>` +
      projects.map(p => `<tr>
        <td>${escapeHtml(p.title)}</td>
        <td>${escapeHtml(p.tech || "")}</td>
        <td><button class="btn btn-danger" data-del="${p.id}">Hapus</button></td>
      </tr>`).join("") + `</tbody></table>`;
    box.querySelectorAll("[data-del]").forEach(b =>
      b.addEventListener("click", async () => {
        if (!confirm("Hapus proyek ini?")) return;
        await fetch(`/api/projects/${b.dataset.del}`, { method: "DELETE", headers: authHeaders() });
        loadProjects();
      }));
  } catch { box.innerHTML = '<p class="muted">Gagal memuat proyek.</p>'; }
}

document.getElementById("project-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById("p-title").value.trim(),
    tech: document.getElementById("p-tech").value.trim(),
    description: document.getElementById("p-desc").value.trim(),
    url: document.getElementById("p-url").value.trim(),
    image: document.getElementById("p-image").value.trim(),
  };
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    e.target.reset();
    loadProjects();
  } else {
    const d = await res.json().catch(() => ({}));
    alert("Gagal: " + (d.error || res.status));
  }
});

// --- Upload file ke R2 ---
document.getElementById("upload-btn").addEventListener("click", async () => {
  const fileInput = document.getElementById("p-file");
  const file = fileInput.files[0];
  if (!file) { alert("Pilih file dulu."); return; }
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload gagal");
    document.getElementById("p-image").value = data.url;
    alert("Upload berhasil: " + data.url);
  } catch (err) {
    alert("Upload gagal: " + err.message);
  }
});

tryEnter();
