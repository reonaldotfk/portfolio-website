document.getElementById("year").textContent = new Date().getFullYear();

// --- Daftar proyek dari API (D1) ---
async function loadProjects() {
  const grid = document.getElementById("projects");
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const projects = await res.json();

    if (!projects.length) {
      grid.innerHTML = '<p class="muted">Belum ada proyek. Tambahkan lewat halaman admin.</p>';
      return;
    }

    grid.innerHTML = projects.map(p => `
      <article class="card project-card">
        ${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy" />` : ""}
        <h3>${escapeHtml(p.title)}</h3>
        ${p.tech ? `<span class="tech">${escapeHtml(p.tech)}</span>` : ""}
        <p>${escapeHtml(p.description || "")}</p>
        ${p.url ? `<a class="link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">Lihat →</a>` : ""}
      </article>
    `).join("");
  } catch (e) {
    grid.innerHTML = '<p class="muted">Gagal memuat proyek. Coba lagi nanti.</p>';
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// --- Formulir kontak ke API (D1) ---
document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById("contact-status");
  const btn = document.getElementById("contact-submit");
  status.textContent = "Mengirim…";
  status.className = "form-status";
  btn.disabled = true;

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Gagal mengirim");
    status.textContent = "Pesan terkirim. Terima kasih!";
    status.className = "form-status ok";
    form.reset();
  } catch (err) {
    status.textContent = "Gagal mengirim: " + err.message;
    status.className = "form-status err";
  } finally {
    btn.disabled = false;
  }
});

loadProjects();
