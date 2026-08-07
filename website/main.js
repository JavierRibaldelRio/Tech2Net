// classify(): keep this logic in sync with scripts/fetch-release.mjs's expectations —
// it consumes the same "assets" shape written by that script into release-data.json.
function classify(assets) {
  const buckets = { windows: [], macArm: [], macIntel: [], linux: [], other: [] };

  for (const a of assets) {
    const n = a.name.toLowerCase();
    if (n.endsWith(".exe") || n.endsWith(".msi")) {
      buckets.windows.push(a);
    } else if (n.endsWith(".dmg") || n.endsWith(".app.tar.gz")) {
      (n.includes("aarch64") ? buckets.macArm : buckets.macIntel).push(a);
    } else if (n.endsWith(".appimage") || n.endsWith(".deb") || n.endsWith(".rpm")) {
      buckets.linux.push(a);
    } else {
      buckets.other.push(a);
    }
  }

  const pick = (list, preferredExt) => {
    if (list.length === 0) return null;
    return list.find((a) => a.name.toLowerCase().endsWith(preferredExt)) || list[0];
  };

  return {
    windows: {
      recommended: pick(buckets.windows, "-setup.exe") || pick(buckets.windows, ".exe"),
      alternates: buckets.windows,
    },
    macArm: { recommended: pick(buckets.macArm, ".dmg"), alternates: buckets.macArm },
    macIntel: { recommended: pick(buckets.macIntel, ".dmg"), alternates: buckets.macIntel },
    linux: { recommended: pick(buckets.linux, ".appimage"), alternates: buckets.linux },
    other: buckets.other,
  };
}

function detectOS() {
  const ua = navigator.userAgent || "";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) {
    return /arm|apple silicon/i.test(navigator.platform || "") ? "macArm" : "macIntel";
  }
  if (/Linux/i.test(ua)) return "linux";
  return null;
}

function formatSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return ` (${mb.toFixed(1)} MB)`;
}

const OS_ICONS = {
  windows:
    '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1 2.5 7 1.6V7.4H1zM8 1.5 15 .5V7.4H8zM1 8.4H7V14.3L1 13.4zM8 8.4H15V15.4L8 14.4z"/></svg>',
  apple:
    '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M10 3.5c.3-.9 1.1-1.5 2-1.5-.1.9-.6 1.7-1.3 2.1.7.1 1.3.5 1.7 1.1-1.2.7-1.9 2-1.9 3.4 0 1.9 1.3 2.8 1.3 2.8s-.9 2.6-2.5 2.6c-.7 0-1-.4-1.9-.4s-1.2.4-1.9.4c-1.6 0-3-2.9-3-5.2 0-2.5 1.6-3.8 3.1-3.8.7 0 1.4.4 1.9.4.4 0 1.3-.5 2.2-.4-.4.1-.8.3-1.7 1.5z"/></svg>',
  linux:
    '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><ellipse cx="8" cy="9.3" rx="4.3" ry="5.1"/><ellipse cx="8" cy="3.2" rx="2.2" ry="2.3"/><circle cx="7.1" cy="2.8" r="0.4" fill="#fff"/><circle cx="8.9" cy="2.8" r="0.4" fill="#fff"/><path d="M5.3 13.6 3.9 15.5h2.1zM10.7 13.6l1.4 1.9h-2.1z"/></svg>',
};

async function init() {
  const versionTag = document.getElementById("version-tag");
  const grid = document.getElementById("downloads-grid");
  const releasesLink = document.getElementById("releases-link");

  let data;
  try {
    const res = await fetch("release-data.json", { cache: "no-store" });
    data = await res.json();
  } catch {
    versionTag.textContent = "No se pudo cargar la información de la última versión.";
    return;
  }

  if (data.releasesIndexUrl) releasesLink.href = data.releasesIndexUrl;

  if (!data.tag) {
    versionTag.textContent = "Aún no hay ninguna versión publicada.";
    return;
  }

  versionTag.textContent = `Última versión: ${data.tag}`;

  const buckets = classify(data.assets || []);
  const detected = detectOS();

  const columns = [
    { key: "windows", label: "Windows", icon: OS_ICONS.windows },
    { key: "macArm", label: "macOS (Apple Silicon)", icon: OS_ICONS.apple },
    { key: "macIntel", label: "macOS (Intel)", icon: OS_ICONS.apple },
    { key: "linux", label: "Linux", icon: OS_ICONS.linux },
  ];

  grid.innerHTML = columns
    .map((col) => {
      const bucket = buckets[col.key];
      const highlight = col.key === detected ? " highlight" : "";

      if (!bucket.recommended) {
        return `<div class="download-card${highlight}">
          <div class="os-icon">${col.icon}</div>
          <h4>${col.label}</h4>
          <p class="unavailable">No disponible en esta versión</p>
        </div>`;
      }

      const alternates = bucket.alternates.filter((a) => a !== bucket.recommended);
      return `<div class="download-card${highlight}">
        <div class="os-icon">${col.icon}</div>
        <h4>${col.label}</h4>
        <a class="primary" href="${bucket.recommended.url}">Descargar${formatSize(bucket.recommended.size)}</a>
        ${
          alternates.length
            ? `<div class="alt-links">${alternates
                .map((a) => `<a href="${a.url}">${a.name}</a>`)
                .join(" · ")}</div>`
            : ""
        }
      </div>`;
    })
    .join("");
}

init();
