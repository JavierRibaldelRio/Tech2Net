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
    { key: "windows", label: "Windows", icon: "🪟" },
    { key: "macArm", label: "macOS (Apple Silicon)", icon: "🍎" },
    { key: "macIntel", label: "macOS (Intel)", icon: "🍎" },
    { key: "linux", label: "Linux", icon: "🐧" },
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
