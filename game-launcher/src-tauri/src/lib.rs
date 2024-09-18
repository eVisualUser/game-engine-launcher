// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use pretty_ini::*;

static DATA_FILE_PATH: &'static str = "./data.ini";

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_saved(key: &str) -> String {
    let mut file = ini_file::IniFile::default();
    file.set_path(DATA_FILE_PATH);

    let mut ini = ini::Ini::default();
    ini.load(&mut file).unwrap();

    match ini.get_ref(ini::TABLE_NAME_ROOT, key) {
        Ok(v) => v.value.clone(),
        Err(_e) => String::new(),
    }
}

#[tauri::command]
fn set_saved(key: &str, value: &str) {
    let mut file = ini_file::IniFile::default();
    file.set_path(DATA_FILE_PATH);

    let mut ini = ini::Ini::default();
    ini.load(&mut file).unwrap();

    match ini.get_ref_mut(ini::TABLE_NAME_ROOT, key) {
        Ok(v) => v.set(value.to_string()),
        Err(_e) => {}
    }

    file.save(&mut ini);
}

#[tauri::command]
async fn run_cmd(program: &str, args: &str) -> Result<(), ()> {
    match std::process::Command::new(program)
        .args(args.split(' '))
        .output()
    {
        Ok(o) => {
            println!(
                "Command stdout result: {}",
                String::from_utf8_lossy(&o.stdout)
            );
            println!(
                "Command stderr result: {}",
                String::from_utf8_lossy(&o.stderr)
            );
        }
        Err(e) => eprintln!("Command failure: {}", e),
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet, get_saved, set_saved, run_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
