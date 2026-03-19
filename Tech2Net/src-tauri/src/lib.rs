// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// Plugins Tauri v2 que vamos a usar
use tauri_plugin_dialog;
use tauri_plugin_shell;
use tauri_plugin_opener;


// --- Comando opcional de ejemplo ---
// Puedes eliminarlo si no lo usas

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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

        // Comandos Rust accesibles desde frontend (opcional)
        .invoke_handler(tauri::generate_handler![greet])

        // Lanzar la aplicación
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}