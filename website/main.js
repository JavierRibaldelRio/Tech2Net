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
    '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="7.55" y="1.2" width="0.9" height="2.3" rx="0.45"/><ellipse cx="9.9" cy="2.3" rx="1.1" ry="0.65" transform="rotate(-25 9.9 2.3)"/><ellipse cx="5.9" cy="9.6" rx="3.3" ry="3.8"/><ellipse cx="9.6" cy="9.3" rx="3.5" ry="4.1"/></svg>',
  linux:
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4l4 4-4 4"/><path d="M9 12h4"/></svg>',
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
