import React, { useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { storeId, getId } from "../utils/IdManager";
export default function Login() {
  const check = async () => {
    const id = await getId();
    if (id != "") {
      window.location.href = "/home";
      console.log("Already logged in");
    }
  };
  check();

  const inputRef = useRef(null);
  const submit = async () => {
    const id = inputRef.current.value;
    await storeId(id);
    window.location.href = "/home";
  };
  const create = async () => {
    const response = await fetch(
      "https://one-clipboard-server.vercel.app/api/get-credentials",
      {
        method: "GET",
      }
    );
    const data = await response.json();
    await storeId(data.id);
    window.location.href = "/home";
  };
  return (
    <div>
      <h1>Login</h1>
      <input ref={inputRef} type="text" placeholder="Enter ID"></input>
      <button
        onClick={() => {
          submit();
        }}
      >
        Login
      </button>
      <button
        onClick={() => {
          create();
        }}
      >
        Create ID
      </button>
    </div>
  );
}
