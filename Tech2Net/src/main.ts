import { openPath } from "@tauri-apps/plugin-opener";
import { open } from "@tauri-apps/plugin-dialog";
import { Command } from "@tauri-apps/plugin-shell";

let selectedFile: string | null = null;

const filePathDiv = document.getElementById("file-path")!;
const logsPre = document.getElementById("logs")!;

// -------- LOG FUNCTION --------

function log(msg: string) {
  logsPre.textContent += msg + "\n";
  logsPre.scrollTop = logsPre.scrollHeight;
}

// -------- SELECT FILE --------

document.getElementById("btn-file")!.addEventListener("click", async () => {

  const file = await open({
    filters: [{ name: "CSV", extensions: ["csv"] }]
  });

  if (typeof file === "string") {
    selectedFile = file;
    filePathDiv.textContent = file;
  }

});

// -------- RUN SCHEDULER --------

document.getElementById("btn-run")!.addEventListener("click", async () => {

  if (!selectedFile) {
    log("No file selected");
    return;
  }

  logsPre.textContent = "";
  log("Starting scheduler...");

  try {

    const file = selectedFile;
    const outputPdf = file.replace(/\.[^.]+$/, ".pdf");

    const companyCols = ["1", "2"];
    const speakerCols = ["3", "4", "5", "6", "7", "8", "9", "10"];
    const timeSlots = ["10:00\u201310:15", "10:20\u201310:35", "10:40\u201310:55", "11:00\u201311:15", "11:20\u201311:35"];

    const args = [
      file,
      "--output", outputPdf,
      "--company-cols", ...companyCols,
      "--speaker-cols", ...speakerCols,
      "--time-slots", ...timeSlots,
    ];

    log("CMD: bin/scheduler " + args.join(" "));

    const cmd = Command.sidecar("bin/scheduler", args);

    // Logs en vivo
    cmd.stdout.on("data", line => log(line));
    cmd.stderr.on("data", line => log("ERR: " + line));

    const result = await cmd.execute();

    log("Finished with code " + result.code);

    // Abrir PDF generado
    await openPath(outputPdf);

  } catch (err) {

    log("Execution failed:");
    log(String(err));

  }

});