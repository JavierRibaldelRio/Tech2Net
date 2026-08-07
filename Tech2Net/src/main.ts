import { openPath } from "@tauri-apps/plugin-opener";
import { open, save } from "@tauri-apps/plugin-dialog";
import { Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";

let selectedFile: string | null = null;
let csvColumnCount = 0;

const filePathDiv  = document.getElementById("file-path")!;
const logsPre      = document.getElementById("logs")!;
const techLogsPre  = document.getElementById("tech-logs")!;
const colLegend    = document.getElementById("col-legend")!;
const errorBanner  = document.getElementById("error-banner")!;
const inputCompany = document.getElementById("company-cols") as HTMLInputElement;
const inputSpeaker = document.getElementById("speaker-cols") as HTMLInputElement;

const btnRun = document.getElementById("btn-run") as HTMLButtonElement;

const creditModalOverlay = document.getElementById("credit-modal-overlay")!;
const creditModalClose   = document.getElementById("credit-modal-close")!;
const btnCopyLink        = document.getElementById("btn-copy-link")!;
const copyFeedback       = document.getElementById("copy-feedback")!;
const mailtoShareLink    = document.getElementById("mailto-share-link") as HTMLAnchorElement;

const helpModalOverlay = document.getElementById("help-modal-overlay")!;
const helpModalClose   = document.getElementById("help-modal-close")!;
const helpBtn          = document.getElementById("help-btn")!;

const REPO_URL = "https://github.com/JavierRibaldelRio/Tech2Net";

function showError(msg: string) {
  errorBanner.textContent = msg;
  errorBanner.hidden = false;
}
function clearError() {
  errorBanner.hidden = true;
  errorBanner.textContent = "";
}

function parseColInput(raw: string): number[] {
  return raw.trim().split(/\s+/).filter(s => s.length > 0).map(Number);
}

function validateInputs(): string | null {
  if (!selectedFile) return "Selecciona un fichero CSV primero.";

  const companyCols = parseColInput(inputCompany.value);
  const speakerCols = parseColInput(inputSpeaker.value);
  const timeSlots   = (document.getElementById("slots") as HTMLTextAreaElement)
                        .value.trim().split(/\n/).map(s => s.trim()).filter(s => s.length > 0);

  if (companyCols.length === 0)
    return "Debes especificar al menos una columna de empresa.";
  if (speakerCols.length === 0)
    return "Debes especificar al menos una columna de ponente.";
  if (companyCols.some(n => isNaN(n) || n < 1))
    return "Las columnas de empresa deben ser números enteros positivos.";
  if (speakerCols.some(n => isNaN(n) || n < 1))
    return "Las columnas de ponente deben ser números enteros positivos.";

  if (csvColumnCount > 0) {
    const badCompany = companyCols.filter(n => n > csvColumnCount);
    if (badCompany.length > 0)
      return `Columna(s) de empresa fuera de rango: ${badCompany.join(", ")} (el CSV tiene ${csvColumnCount} columnas).`;
    const badSpeaker = speakerCols.filter(n => n > csvColumnCount);
    if (badSpeaker.length > 0)
      return `Columna(s) de ponente fuera de rango: ${badSpeaker.join(", ")} (el CSV tiene ${csvColumnCount} columnas).`;
  }

  const overlap = companyCols.filter(n => speakerCols.includes(n));
  if (overlap.length > 0)
    return `La(s) columna(s) ${overlap.join(", ")} están en empresa y ponente a la vez.`;

  if (timeSlots.length === 0)
    return "Debes definir al menos un time slot.";

  return null;
}

// -------- LOG FUNCTIONS --------

function log(msg: string) {
  logsPre.textContent += msg + "\n";
  logsPre.scrollTop = logsPre.scrollHeight;
}

function techLog(msg: string) {
  techLogsPre.textContent += msg + "\n";
  techLogsPre.scrollTop = techLogsPre.scrollHeight;
}

function logFriendlyStdout(stdout: string) {
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    let m: RegExpMatchArray | null;

    if ((m = trimmed.match(/^Reuniones:\s*(\d+)/))) {
      log(`📅 Reuniones programadas: ${m[1]}`);
    } else if ((m = trimmed.match(/^Speakers cubiertos:\s*(\d+)/))) {
      log(`🎤 Ponentes con al menos una reunión: ${m[1]}`);
    } else if ((m = trimmed.match(/^Empresas cubiertas:\s*(\d+)/))) {
      log(`🏢 Empresas con al menos una reunión: ${m[1]}`);
    } else if (/^Optimal:\s*True/.test(trimmed)) {
      log("✅ Se ha encontrado la mejor combinación posible.");
    } else if (/^Optimal:\s*False/.test(trimmed)) {
      log("⚠️ No se pudo confirmar que sea la combinación óptima en el tiempo disponible, pero el horario generado es válido.");
    } else if (/^PDF generated:/.test(trimmed)) {
      log("📄 PDF generado correctamente.");
    }
  }
}

// -------- BUTTON LOADING STATE --------

async function withButtonLoading<T>(
  btn: HTMLButtonElement,
  loadingHtml: string,
  fn: () => Promise<T>
): Promise<T> {
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = loadingHtml;
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// -------- COLUMN HIGHLIGHT --------

function updateColumnHighlights() {
  const companyCols = new Set(inputCompany.value.trim().split(/\s+/));
  const speakerCols = new Set(inputSpeaker.value.trim().split(/\s+/));

  document.querySelectorAll<HTMLElement>("#csv-preview [data-col]").forEach(el => {
    const col = el.dataset.col!;
    el.classList.remove("col-company", "col-speaker", "col-none");
    if (companyCols.has(col))      el.classList.add("col-company");
    else if (speakerCols.has(col)) el.classList.add("col-speaker");
    else                           el.classList.add("col-none");
  });
}

inputCompany.addEventListener("input", updateColumnHighlights);
inputSpeaker.addEventListener("input", updateColumnHighlights);

// -------- SLOTS PREVIEW --------

const slotsTextarea = document.getElementById("slots") as HTMLTextAreaElement;
const slotsPreview  = document.getElementById("slots-preview")!;

function updateSlotsPreview() {
  const lines = slotsTextarea.value.split("\n").map(s => s.trim()).filter(s => s.length > 0);
  slotsPreview.innerHTML = "";
  lines.forEach((line, i) => {
    const pill = document.createElement("span");
    pill.className = "slot-pill";
    const num = document.createElement("span");
    num.className = "slot-num";
    num.textContent = String(i + 1);
    pill.appendChild(num);
    pill.appendChild(document.createTextNode(line));
    slotsPreview.appendChild(pill);
  });
}

slotsTextarea.addEventListener("input", updateSlotsPreview);
updateSlotsPreview();

// -------- SELECT FILE --------

document.getElementById("btn-file")!.addEventListener("click", async () => {

  const file = await open({
    filters: [{ name: "CSV", extensions: ["csv"] }]
  });

  if (typeof file === "string") {
    selectedFile = file;
    filePathDiv.textContent = file;

    const rows = await invoke<string[][]>("read_csv_preview", { path: file, rows: 4 });
    csvColumnCount = rows[0]?.length ?? 0;
    clearError();
    const previewDiv = document.getElementById("csv-preview")!;

    const table = document.createElement("table");
    rows.forEach((row, i) => {
      const tr = document.createElement("tr");
      row.forEach((cell, j) => {
        const el = document.createElement(i === 0 ? "th" : "td");
        el.dataset.col = String(j + 1);
        if (i === 0) {
          const num = document.createElement("span");
          num.className = "col-num";
          num.textContent = `[${j + 1}]`;
          el.appendChild(num);
          el.appendChild(document.createTextNode(cell));
        } else {
          el.textContent = cell;
        }
        tr.appendChild(el);
      });
      table.appendChild(tr);
    });

    previewDiv.innerHTML = "";
    previewDiv.appendChild(table);
    colLegend.hidden = false;
    updateColumnHighlights();
  }

});

// -------- MODAL FACTORY --------

function setupModal(overlay: HTMLElement, closeBtn: HTMLElement) {
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  function open() {
    overlay.hidden = false;
    document.addEventListener("keydown", handleKeydown);
  }

  function close() {
    overlay.hidden = true;
    document.removeEventListener("keydown", handleKeydown);
  }

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  return { open, close };
}

// -------- CREDIT MODAL --------

const creditModal = setupModal(creditModalOverlay, creditModalClose);

btnCopyLink.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(REPO_URL);
    copyFeedback.hidden = false;
    setTimeout(() => { copyFeedback.hidden = true; }, 2000);
  } catch (err) {
    techLog("No se pudo copiar el enlace: " + String(err));
  }
});

const mailSubject = encodeURIComponent("Descubre Tech2Net");
const mailBody = encodeURIComponent(
  "Hola,\n\nQuería compartirte Tech2Net, una herramienta para generar horarios de " +
  "reuniones optimizados a partir de un fichero CSV:\n" + REPO_URL + "\n\n¡Un saludo!"
);
mailtoShareLink.href = "mailto:?subject=" + mailSubject + "&body=" + mailBody;

// -------- HELP MODAL --------

const helpModal = setupModal(helpModalOverlay, helpModalClose);
helpBtn.addEventListener("click", helpModal.open);

// -------- RUN SCHEDULER --------

btnRun.addEventListener("click", async () => {

  clearError();

  const validationError = validateInputs();
  if (validationError) {
    showError(validationError);
    return;
  }

  logsPre.textContent = "";
  techLogsPre.textContent = "";

  await withButtonLoading(btnRun, `<span class="btn-icon">⏳</span> Generando…`, async () => {

    log("⏳ Generando el horario… esto puede tardar hasta un minuto.");

    try {

      const file = selectedFile!;

      const outputPdf = await save({
        filters: [{ name: "PDF", extensions: ["pdf"] }],
        defaultPath: file.replace(/\.[^.]+$/, ".pdf"),
      });

      if (!outputPdf) {
        log("Operación cancelada.");
        return;
      }

      const companyCols = parseColInput(inputCompany.value).map(String);
      const speakerCols = parseColInput(inputSpeaker.value).map(String);
      const timeSlots = (document.getElementById("slots") as HTMLTextAreaElement).value.trim().split(/\n/).map(s => s.trim()).filter(s => s.length > 0);

      const args = [
        file,
        "--output", outputPdf,
        "--company-cols", ...companyCols,
        "--speaker-cols", ...speakerCols,
        "--time-slots", ...timeSlots,
      ];

      techLog("CMD: bin/scheduler " + args.join(" "));

      const cmd = Command.sidecar("bin/scheduler", args);

      const result = await cmd.execute();

      if (result.stdout) {
        techLog(result.stdout);
        logFriendlyStdout(result.stdout);
      }
      if (result.stderr) {
        techLog("ERR: " + result.stderr);
        log("⚠️ Se han detectado avisos técnicos. Revisa los detalles técnicos si el resultado no es el esperado.");
      }

      techLog("Finished with code " + result.code);

      log("✅ ¡Horario generado con éxito! Abriendo el PDF…");

      await openPath(outputPdf);

      if (Math.random() < 1 / 3) {
        creditModal.open();
      }

    } catch (err) {

      log("❌ Ha ocurrido un error al generar el horario. Revisa los datos e inténtalo de nuevo.");
      techLog("Execution failed:");
      techLog(String(err));

    }

  });

});