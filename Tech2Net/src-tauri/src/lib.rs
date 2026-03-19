// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// Plugins Tauri v2 que vamos a usar
use tauri_plugin_dialog;
use tauri_plugin_shell;
use tauri_plugin_opener;

use std::fs::File;
use std::io::{BufRead, BufReader};


// --- Lee las primeras N líneas de un CSV y las devuelve ---

#[tauri::command]
fn read_csv_preview(path: String, rows: usize) -> Result<Vec<Vec<String>>, String> {
    let file = File::open(&path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);

    let result: Vec<Vec<String>> = reader
        .lines()
        .take(rows)
        .filter_map(|l| l.ok())
        .map(|line| {
            line.split(',')
                .map(|cell| cell.trim().to_string())
                .collect()
        })
        .collect();

    Ok(result)
}


// --- Entry point principal de la app ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()

        // Permite abrir archivos con apps externas (ej. PDF)
        .plugin(tauri_plugin_opener::init())

        // Selector de archivos (CSV)
        .plugin(tauri_plugin_dialog::init())

        // Ejecutar procesos externos (tu scheduler Python)
        .plugin(tauri_plugin_shell::init())

        // Comandos Rust accesibles desde frontend
        .invoke_handler(tauri::generate_handler![read_csv_preview])

        // Lanzar la aplicación
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}