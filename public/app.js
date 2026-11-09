// ---------- Util ----------
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
const $ = (sel) => document.querySelector(sel);

// ---------- Tahun & jam WIB ----------
const now = new Date();
$("#year").textContent = now.getFullYear();
$("#preloader-year").textContent = now.getFullYear();

function tickClock() {
  const t = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date());
  $("#clock").textContent = "WIB " + t;
}
tickClock();
setInterval(tickClock, 1000);

// ---------- Preloader ----------
const preloader = $("#preloader");
const countEl = $("#preloader-count");
let preloaderDone = false;

function finishPreloader() {
  if (preloaderDone) return;
  preloaderDone = true;
  preloader.classList.add("is-done");
  document.body.classList.add("is-loaded");
  setTimeout(() => preloader.remove(), 1100);
}

(function runPreloader() {
  const duration = 1400;
  const start = performance.now();
  function step(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    countEl.textContent = Math.round(eased * 100);
    if (p < 1) requestAnimationFrame(step);
    else setTimeout(finishPreloader, 250);
  }
  requestAnimationFrame(step);
  // Pengaman: jangan sampai preloader macet
  setTimeout(finishPreloader, 4000);
  preloader.addEventListener("click", finishPreloader);
})();

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Pernyataan About: kata menyala saat scroll ----------
const statement = $("#about-statement");
const words = statement.textContent.trim().split(/\s+/);
statement.innerHTML = words.map((w) => `<span class="w">${escapeHtml(w)}</span>`).join(" ");
const wordSpans = statement.querySelectorAll(".w");
function lightWords() {
  const rect = statement.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (rect.height + vh * 0.3)));
  const lit = Math.floor(progress * wordSpans.length);
  wordSpans.forEach((s, i) => s.classList.toggle("lit", i < lit));
}
window.addEventListener("scroll", lightWords, { passive: true });
lightWords();

// ---------- Parallax ringan (rAF + lerp) ----------
const parallaxEls = [...document.querySelectorAll("[data-speed]")];
let scrollY = window.scrollY;
let targetY = window.scrollY;
window.addEventListener("scroll", () => { targetY = window.scrollY; }, { passive: true });
function parallaxLoop() {
  scrollY += (targetY - scrollY) * 0.12;
  parallaxEls.forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0");
    el.style.transform = `translateY(${scrollY * speed}px)`;
  });
  requestAnimationFrame(parallaxLoop);
}
if (parallaxEls.length) parallaxLoop();

// ---------- Kursor kustom ----------
const cursor = $("#cursor");
const cursorLabel = $("#cursor-label");
let mx = -100, my = -100, cx = -100, cy = -100;
window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
(function cursorLoop() {
  cx += (mx - cx) * 0.2;
  cy += (my - cy) * 0.2;
  cursor.style.left = cx + "px";
  cursor.style.top = cy + "px";
  cursorLabel.style.left = cx + "px";
  cursorLabel.style.top = cy + "px";
  requestAnimationFrame(cursorLoop);
})();
document.addEventListener("mouseover", (e) => {
  const interactive = e.target.closest("a, button, .work-row");
  cursor.classList.toggle("is-hover", !!interactive);
  cursorLabel.classList.toggle("is-visible", !!e.target.closest(".work-row"));
});

// ---------- Proyek: dari API (D1), fallback contoh ----------
const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: "Website Portfolio",
    tech: "HTML · CSS · JavaScript",
    description: "Portfolio modern dengan Cloudflare Pages, R2 untuk file, dan D1 untuk data.",
    url: "https://github.com/reonaldotfk/portfolio-website",
    image: "https://picsum.photos/seed/reo-project-1/800/600",
  },
  {
    id: 2,
    title: "API Serverless",
    tech: "Cloudflare Workers · D1 · R2",
    description: "REST API tanpa server menggunakan Pages Functions dan database D1 di edge.",
    url: "",
    image: "https://picsum.photos/seed/reo-project-2/800/600",
  },
  {
    id: 3,
    title: "Dashboard Analitik",
    tech: "JavaScript · REST API",
    description: "Dashboard ringan untuk memantau data proyek dan pesan masuk secara real-time.",
    url: "",
    image: "https://picsum.photos/seed/reo-project-3/800/600",
  },
];

const workList = $("#work-list");
const workImages = $("#work-images");
const workPreview = $("#work-preview");
const workPreviewImg = $("#work-preview-img");
const metaTitle = $("#work-meta-title");
const metaTech = $("#work-meta-tech");
const metaDesc = $("#work-meta-desc");
const metaLink = $("#work-meta-link");

function setActiveProject(p, rowEl, imgEl) {
  metaTitle.textContent = p.title;
  metaTech.textContent = p.tech || "";
  metaDesc.textContent = p.description || "";
  if (p.url) {
    metaLink.style.display = "inline-block";
    metaLink.href = p.url;
  } else {
    metaLink.style.display = "none";
  }
  document.querySelectorAll(".work-row").forEach((r) => r.classList.remove("is-active"));
  document.querySelectorAll(".work-images img").forEach((i) => i.classList.remove("is-active"));
  if (rowEl) rowEl.classList.add("is-active");
  if (imgEl) imgEl.classList.add("is-active");
  if (p.image) workPreviewImg.src = p.image;
}

function renderProjects(projects) {
  $("#work-count").textContent = String(projects.length).padStart(2, "0");
  workList.innerHTML = "";
  workImages.innerHTML = "";

  projects.forEach((p, i) => {
    const img = p.image || `https://picsum.photos/seed/reo-project-${p.id || i + 1}/800/600`;

    const row = document.createElement("a");
    row.className = "work-row";
    row.href = p.url || "#proyek";
    if (!p.url) row.addEventListener("click", (e) => e.preventDefault());
    row.innerHTML = `
      <span class="work-row-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="work-row-title">${escapeHtml(p.title)}</span>
      <span class="work-row-cat">${escapeHtml(p.tech || "")}</span>
    `;
    workList.appendChild(row);

    const imgEl = document.createElement("img");
    imgEl.src = img;
    imgEl.alt = p.title;
    imgEl.loading = "lazy";
    imgEl.dataset.speed = i % 2 === 0 ? "0.05" : "-0.04";
    workImages.appendChild(imgEl);
    parallaxEls.push(imgEl);

    const activate = () => setActiveProject({ ...p, image: img }, row, imgEl);
    row.addEventListener("mouseenter", () => {
      activate();
      workPreview.classList.add("is-visible");
    });
    row.addEventListener("mouseleave", () => workPreview.classList.remove("is-visible"));
    row.addEventListener("click", activate);
    imgEl.addEventListener("mouseenter", activate);
  });

  if (projects.length) setActiveProject(
    { ...projects[0], image: projects[0].image || `https://picsum.photos/seed/reo-project-${projects[0].id || 1}/800/600` },
    workList.querySelector(".work-row"),
    workImages.querySelector("img")
  );
}

async function loadProjects() {
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const projects = await res.json();
    renderProjects(projects.length ? projects : FALLBACK_PROJECTS);
  } catch (e) {
    renderProjects(FALLBACK_PROJECTS);
  }
}

// Pratinjau mengikuti kursor (desktop)
window.addEventListener("mousemove", (e) => {
  workPreview.style.left = e.clientX + "px";
  workPreview.style.top = e.clientY + "px";
});

loadProjects();

// ---------- Formulir kontak ----------
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
