// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rdev::{listen, Event};
use std::thread;
extern crate copypasta;
use std::thread::sleep;
use std::time::Duration;
use copypasta::{ClipboardContext, ClipboardProvider};
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use tauri::api::path::document_dir;
use reqwest::Client;
use serde_json::json;
use std::error::Error;
use tauri::{Manager, Window,Wry};

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}
#[tauri::command]
fn store_id(id: String) -> Result<(), String> {
    let path = document_dir().map(|p| p.join("id.txt")).ok_or("Unable to get document directory")?;
    let mut file = OpenOptions::new().write(true).create(true).open(&path)
        .map_err(|e| e.to_string())?;
    file.write_all(id.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_id() -> Result<String, String> {
    let path = document_dir().map(|p| p.join("id.txt")).ok_or("Unable to get document directory")?;
    let mut file = File::open(&path).map_err(|e| e.to_string())?;
    let mut id = String::new();
    file.read_to_string(&mut id).map_err(|e| e.to_string())?;
    Ok(id)
}



async fn send_copy_text(text:String,id:String) -> Result<(), Box<dyn std::error::Error>> {
    let url = "localhost:3000/api/copy-event";
    let post_data = json!({
        "text":text,
        "id":id
    });
    let post_data_string = serde_json::to_string(&post_data)?;
    let response = Client::new()
        .post(url)
        .header("Content-Type", "application/json")
        .body(post_data_string)
        .send()
        .await?;

    // Check if the request was successful
    if response.status().is_success() {
        // Read the response body as text
        let body = response.text().await?;
        println!("Response Body: {}", body);
    } else {
        println!("Request failed with status: {}", response.status());
    }

    Ok(())
    
}
fn result_to_string(result: Result<String, String>) -> String {
    match result {
        Ok(value) => value,
        Err(error) => format!("Error: {}", error), // Handle the error as needed
    }
}
fn callback(event: Event,main_window:Window) {
    // if(event.name == "\u{3}"){
    //     println!("Copied");
    // }
    // print!("My callback {:?}", event.name);
    // println!( "{:?}",event.event_type);
   

    match event.name {
        Some(string) => {
            if string == "\u{3}" {
                sleep(Duration::from_millis(400));
                let mut ctx = ClipboardContext::new().unwrap();
                let  content = ctx.get_contents().unwrap();
                // let id = result_to_string(get_id());
                main_window.emit("copy_event",Payload{message:content.into()}).unwrap();
                // let _response  = send_copy_text(content,id);
                
                println!("User copied ");
            }
            else if string == "\u{16}" {
                println!("user pasted");
            }
        },
        None => (),
    }
    
}

fn main() {
    
    tauri::Builder::default()
    .setup(|app| {
        // `main` here is the window label; it is defined on the window creation or under `tauri.conf.json`
        // the default value is `main`. note that it must be unique
        let main_window = app.get_window("main").unwrap();
        
        // listen to the `event-name` (emitted on the `main` window)
        let id = main_window.listen("event-name", |event| {
            println!("got window event-name with payload {:?}", event.payload());
        });
        // unlisten to the event using the `id` returned on the `listen` function
        // an `once` API is also exposed on the `Window` struct
        let window_clone = main_window.clone();
        thread::spawn(move || {
            listen_for_copy_event(window_clone);
        });
        main_window.unlisten(id);
  
        // emit the `event-name` event to the `main` window
        main_window.emit("event-name", Payload { message: "Tauri is awesome!".into() }).unwrap();
        Ok(())
      })
        .invoke_handler(tauri::generate_handler![store_id, get_id])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn handler(window:&Window<Wry>){
    
}

fn listen_for_copy_event(window: Window<Wry>) {
    listen(move |event: Event| {
        // println!("{:?}",event.name);
        match event.name {
            Some(string) => {
                if string == "\u{3}" {
                    sleep(Duration::from_millis(400));
                    let mut ctx = ClipboardContext::new().unwrap();
                    let  content = ctx.get_contents().unwrap();
                    println!("User copied ");
                    send_result_to_frontend(&window,content,"copy-event");
                    
                }
                else if string == "\u{16}" {
                    println!("User pasted");
                    send_result_to_frontend(&window,"".to_string(),"paste-event");
                }
            },
            None => (),
        }
    }).unwrap();
}

fn send_result_to_frontend(window: &Window<Wry>, result: String,event:&str) {
    window.emit(event, Some(result)).unwrap();
}