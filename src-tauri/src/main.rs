#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev::{listen, Event,EventType};
use std::fs::{remove_file, File, OpenOptions};
use std::thread::sleep;
use tauri::{AppHandle, Manager};
extern crate copypasta;
use copypasta::{ClipboardContext, ClipboardProvider};
use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Settings,
};
use open;
use once_cell::sync::Lazy;
use serde_json::Value;
use std::error::Error;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use tauri::api::path::document_dir;
use tokio::runtime::Runtime;
use tokio::task;
use std::sync::atomic::{AtomicBool, Ordering};


#[derive(Clone, serde::Serialize)]
struct ID {
    id: String,
}
#[derive(Clone, serde::Serialize)]
struct Content {
    id: String,
    text: String,
}
#[derive(Clone, serde::Serialize)]
struct Text {
    text: String,
}

static GLOBAL_APP_HANDLE: Lazy<Arc<Mutex<Option<AppHandle>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

async fn upload_clipboard_content(content: String) -> Result<(), Box<dyn Error>> {
    let id = get_id().unwrap();
    let client = reqwest::Client::new();
    let _res = client
        .post("https://one-clipboard-server.vercel.app/api/copy-event")
        .json(&Content { id, text: content })
        .send()
        .await;
    // println!("Response: {:?}", res);
    Ok(())
}

async fn download_clipboard_content() -> Result<String, Box<dyn Error>> {
    // Assuming get_id() is a function that returns Option<String>
    let id = get_id().unwrap();

    let client = reqwest::Client::new();
    let res = client
        .post("https://one-clipboard-server.vercel.app/api/paste-event")
        .json(&ID { id })
        .send()
        .await?;

    let text = res.text().await?;
    let json_value: Value = serde_json::from_str(&text)?;

    if let Some(text_value) = json_value.get("text") {
        if let Some(text_str) = text_value.as_str() {
            Ok(text_str.to_string())
        } else {
            Err("The 'text' key is not a string.".into())
        }
    } else {
        Err("The 'text' key does not exist.".into())
    }
}
async fn handle_event(event: Event,ctrl_pressed: &Arc<AtomicBool>) {
    let app_handle = {
        let lock = GLOBAL_APP_HANDLE.lock().unwrap();
        lock.clone()
    };
    
    
    if let Some(app_handle) = app_handle {

        match event.event_type {
        EventType::KeyPress(key) => {
            if key == rdev::Key::ControlLeft || key == rdev::Key::ControlRight {
                // Handle Control key press
                
                ctrl_pressed.store(true, Ordering::SeqCst);
                // println!("Control key pressed");
            }
            else if key == rdev::Key::KeyC && ctrl_pressed.load(Ordering::SeqCst) {
                // Handle Control key release
                sleep(std::time::Duration::from_millis(1000));
                let mut ctx = ClipboardContext::new().unwrap();
                let content = ctx.get_contents().unwrap();
                println!("Copied: {:?}", content.clone());
                let _ = upload_clipboard_content(content).await;
            }
            else if key == rdev::Key::KeyL && ctrl_pressed.load(Ordering::SeqCst) {
                sleep(std::time::Duration::from_millis(1000));
                let text = download_clipboard_content().await.unwrap();
                let mut ctx = ClipboardContext::new().unwrap();
                ctx.set_contents(text.clone()).unwrap();
                let mut enigo = Enigo::new(&Settings::default()).unwrap();
                println!("Pasted: {:?}", text);
                let _ = enigo.key(Key::Control, Press);
                let _ = enigo.key(Key::Unicode('v'), Click);
                let _ = enigo.key(Key::Control, Release);
                app_handle
                    .emit_to("main","paste-event", Some(Text { text }))
                    .unwrap();
            }
            // println!("Key: {:?}", key);
            // println!("Control key pressed: {:?}", ctrl_pressed.load(Ordering::SeqCst));
        }
       
      
        EventType::KeyRelease(key) => {
            if key == rdev::Key::ControlLeft || key == rdev::Key::ControlRight {
                // Handle Control key release
                ctrl_pressed.store(false, Ordering::SeqCst);
                
                // println!("Control key released");
            }
        }
        _ => {}
    }
}
        // match event.event_type {
            
        
        // }
        // println!("Event: {:?}", event);
        // match event.name {
        //     Some(name) => {
        //         if name == "\u{3}" {
        //             sleep(std::time::Duration::from_millis(1000));
        //             let mut ctx = ClipboardContext::new().unwrap();
        //             let content = ctx.get_contents().unwrap();
        //             println!("Content: {:?}", content.clone());
        //             let _ = upload_clipboard_content(content).await;
        //         }
        //         if name == "\u{c}" {
        //             sleep(std::time::Duration::from_millis(1000));
        //             let text = download_clipboard_content().await.unwrap();
        //             let mut ctx = ClipboardContext::new().unwrap();
        //             ctx.set_contents(text.clone()).unwrap();
        //             let mut enigo = Enigo::new(&Settings::default()).unwrap();

        //             let _ = enigo.key(Key::Control, Press);
        //             let _ = enigo.key(Key::Unicode('v'), Click);
        //             let _ = enigo.key(Key::Control, Release);
        //             app_handle
        //                 .emit_to("main","paste-event", Some(Text { text }))
        //                 .unwrap();
        //         }
        //     }
        //     None => (),
        // }
    
    // }
}

#[tauri::command]
fn open_in_browser(url: String) {
    println!("Opening in browser: {}", url);
    open::that(url).unwrap();
}

#[tauri::command]
fn store_id(id: String) -> Result<(), String> {
    let path = document_dir()
        .map(|p| p.join("clipo/id.clipo"))
        .ok_or("Unable to get document directory")?;
    if path.exists() {
        remove_file(&path).map_err(|e| e.to_string())?;
    }
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    file.write_all(id.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_id() -> Result<String, String> {
    let path = document_dir()
        .map(|p| p.join("clipo/id.clipo"))
        .ok_or("Unable to get document directory")?;
    let mut file = File::open(&path).map_err(|e| e.to_string())?;
    let mut id = String::new();
    file.read_to_string(&mut id).map_err(|e| e.to_string())?;
    Ok(id)
}

fn main() {
    let ctrl_pressed = Arc::new(AtomicBool::new(false));
    let ctrl_pressed_clone = Arc::clone(&ctrl_pressed);
    let runtime = Runtime::new().unwrap();
    runtime.spawn(async move {
        let listener = task::spawn_blocking(|| {
            if let Err(error) = listen(move |event| {
                let ctrl_pressed_clone = Arc::clone(&ctrl_pressed_clone);
                tokio::spawn(async move {
                    handle_event(event, &ctrl_pressed_clone).await;
                });
            }) {
                println!("Error: {:?}", error);
            }
        });

        listener.await.unwrap();
    });
    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle();
            let mut lock = GLOBAL_APP_HANDLE.lock().unwrap();
            *lock = Some(app_handle.clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![store_id, get_id,open_in_browser])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn event_handler(event: Event) {
    let ctrl_pressed = Arc::new(AtomicBool::new(false));
    let ctrl_pressed_clone = Arc::clone(&ctrl_pressed);
    tokio::spawn(async move {
        let ctrl_pressed_clone = Arc::clone(&ctrl_pressed_clone);
        handle_event(event, &ctrl_pressed_clone).await;
    });
}
