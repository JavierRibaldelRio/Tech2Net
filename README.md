# Tech2Net

**Tech2Net** is a cross-platform desktop app that generates optimised 1-on-1 meeting schedules from a CSV file. Given a list of companies and speakers plus a set of time slots, it uses constraint-satisfaction optimisation to maximise coverage and produce a ready-to-share PDF report.

🔗 **[Website & downloads](https://javierribaldelrio.github.io/Tech2Net/)**

---

## Features

- **CSV preview** — loads and displays your file with per-column colour coding (company / speaker / unassigned)
- **Flexible column mapping** — configure any 1-based column indices for company and speaker roles
- **Time slot editor** — define as many slots as needed; live pill preview updates as you type
- **Constraint optimisation** — Google OR-Tools CP-SAT solver maximises speaker coverage, then company coverage, then total meetings
- **PDF report** — generates a structured report with global schedule, per-company and per-speaker breakdowns
- **Cross-platform** — ships as native installers for Windows, macOS (Intel and Apple Silicon) and Linux
- **Non-technical friendly UI** — fully localised in Spanish, with an in-app help guide, a friendly progress log (raw technical output tucked behind a "ver detalles técnicos" toggle), and a loading state while the schedule is generated
- **Marketing website** — a static site under [`website/`](website/), auto-redeployed on every published GitHub Release so its download links never go stale

---

## Architecture

```
┌─────────────────────────┐
│  Frontend               │   TypeScript + HTML/CSS (Vite)
└────────────┬────────────┘
             │  Tauri IPC
┌────────────▼────────────┐
│  Tauri Core (Rust)      │   read_csv_preview · dialog · shell · opener
└────────────┬────────────┘
             │  spawns
┌────────────▼────────────┐
│  Python Optimizer       │   pandas · OR-Tools · xhtml2pdf
│                         │   CSV → solve → PDF
└─────────────────────────┘
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| [Rust](https://rustup.rs/) | stable |
| [Node.js](https://nodejs.org/) | 20+ |
| [Python](https://www.python.org/) | 3.11+ |

### 1 — Run in development mode

```bash
cd Tech2Net
npm install
npm run tauri dev
```

### 2 — Build a production installer

```bash
cd Tech2Net
npm run tauri build
```

Installers are written to `Tech2Net/src-tauri/target/release/bundle/`.

### 3 — Preview the website locally

```bash
cd website
node scripts/fetch-release.mjs   # requires `gh auth login`; fetches the latest release's real assets
python3 -m http.server 8080
```

Open `http://localhost:8080`. `release-data.json` is git-ignored — CI regenerates it fresh into the deployed Pages artifact on every run (see below), it's never committed to the repo.

---

## CI/CD

Two GitHub Actions workflows:

**`build.yml`** — builds the app for all four targets on every tagged release (`v*`):

| Platform | Runner | Architecture |
|----------|--------|--------------|
| Linux | ubuntu-22.04 | x86_64 |
| Windows | windows-latest | x86_64 |
| macOS | macos-latest | Apple Silicon (aarch64) |
| macOS | macos-13 | Intel (x86_64) |

Each run builds the Tauri bundle and attaches the installers to a **draft** GitHub Release for manual review before publishing.

**`website.yml`** — builds and deploys [`website/`](website/) to GitHub Pages whenever a release is published, whenever `website/**` changes on `Tauri-main`, or manually via `workflow_dispatch`. It fetches the latest published release from the GitHub API at build time and bakes the real download links into the deployed site — no client-side polling, no stale links.

---

## Tech Stack

- **[Tauri 2](https://tauri.app/)** — desktop framework (Rust core)
- **[Vite 6](https://vitejs.dev/) + TypeScript** — frontend build
- **[Google OR-Tools](https://developers.google.com/optimization) CP-SAT** — constraint-satisfaction solver
- **[pandas](https://pandas.pydata.org/)** — CSV ingestion
- **[xhtml2pdf](https://xhtml2pdf.com/) + ReportLab** — PDF generation
- **Vanilla HTML/CSS/JS** — the marketing website (`website/`), no framework or build step

---

## Author

**Javier Ribal del Río** — student of the double degree in Business Administration (ADE) at the Universitat Politècnica de València (UPV)
&nbsp;·&nbsp; [GitHub](https://github.com/JavierRibaldelRio)
&nbsp;·&nbsp; [LinkedIn](https://www.linkedin.com/in/javier-ribal-del-rio/)
