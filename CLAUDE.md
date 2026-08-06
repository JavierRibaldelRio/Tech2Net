# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Directory layout

The repo root (`Tech2Net/`) contains two separately-versioned components with a nested-name folder that's an easy source of `cd` confusion:

- `Tech2Net/Tech2Net/` — the Tauri desktop app (Rust core + vanilla TS/Vite frontend)
- `Tech2Net/optimizer/` — the Python scheduler/optimizer, built and shipped as a compiled sidecar binary

## Commands

### Frontend / Tauri app

```bash
cd Tech2Net
npm install
npm run tauri dev      # dev mode (spawns Vite + Rust)
npm run build           # frontend only: tsc && vite build
npm run tauri build     # full installer, output in src-tauri/target/release/bundle/
```

### Python optimizer (standalone CLI, no Tauri needed)

Useful for iterating on the solver or PDF report logic directly:

```bash
cd optimizer
pip install -r requirements.txt
python main.py <csv_file> \
  [--company-cols COL ...] [--speaker-cols COL ...] \
  [--time-slots SLOT ...] [--output agenda.pdf]
```

### Building the sidecar binary manually

The frontend invokes the optimizer as a compiled sidecar, not a live Python interpreter, so after changing optimizer code it must be rebuilt and copied into place (this mirrors the `.github/workflows/build.yml` CI step):

```bash
cd optimizer
pyinstaller --onefile --collect-all ortools --collect-all xhtml2pdf --collect-all reportlab --name scheduler main.py
cp dist/scheduler ../Tech2Net/src-tauri/bin/scheduler-<target-triple>   # e.g. scheduler-x86_64-unknown-linux-gnu
```

The `scheduler-<target-triple>` naming is Tauri's `externalBin` convention (see `src-tauri/tauri.conf.json`) — without it, `tauri dev`/`tauri build` won't find the sidecar.

There is no test suite in this repository.

## Architecture

Three-tier pipeline: TS frontend → Rust/Tauri core → Python optimizer sidecar.

- **Frontend** (`Tech2Net/src/main.ts`, vanilla TS, no framework/build components): handles CSV preview, column-mapping validation, and time-slot editing. It calls the Rust `read_csv_preview` command to preview the CSV, then runs the scheduler via `Command.sidecar("bin/scheduler", args)`. The CLI args it builds (`--company-cols`, `--speaker-cols`, `--time-slots`, `--output`) must exactly match `optimizer/main.py`'s argparse interface — the two are not type-checked against each other, so changing one requires updating the other.

- **Rust/Tauri core** (`src-tauri/src/lib.rs`): thin glue layer. Exposes one custom command, `read_csv_preview`, and registers the dialog/shell/opener plugins so the frontend can pick a CSV file, execute the sidecar, and open the resulting PDF. Sidecar execution and file-open path permissions are declared in `src-tauri/capabilities/default.json`.

- **Python optimizer** (`Tech2Net/optimizer/`):
  - `input.py::load_matrix` — parses the CSV using 1-based column indices into `{companies, speakers, matrix}`, where `matrix` maps each speaker to the companies they're available to meet.
  - `optimizer.py::optimize` — builds an OR-Tools CP-SAT model over boolean vars `x[(speaker, company, slot)]`. Constraints: one meeting per speaker/company per slot, each speaker-company pair meets at most once. The objective lexicographically prioritizes speaker coverage (weight `1_000_000`) over company coverage (weight `100_000`) over total meeting count — this priority ordering is the scheduler's core business rule and must be preserved if the objective function is ever touched.
  - `pdf_report.py::generate_pdf` — renders the schedule to PDF (global schedule + per-company + per-speaker sections) via `xhtml2pdf`, and also writes a sibling `<output>_matrix.xlsx` pivot table (slot × speaker → company) via pandas/openpyxl.
  - `main.py` — the CLI entry point that PyInstaller packages into the sidecar binary; its argparse flags are the contract the frontend depends on.

- **CI** (`.github/workflows/build.yml`): on pushing a `v*` tag, builds the PyInstaller sidecar per-OS (Linux, Windows, macOS Intel/ARM), copies it into `src-tauri/bin/` under the target-triple naming Tauri expects, then runs `tauri-apps/tauri-action` to build and publish installers as a draft GitHub Release.
