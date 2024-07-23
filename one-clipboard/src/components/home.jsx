import { emit, listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { storeId, getId } from "../utils/IdManager";

export default function Home() {
  const [id, setId] = useState("");
  const [text, setText] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const id = await getId();
      setId(id);
    };
    fetchData();
  }, []);
  useEffect(() => {
    listen("copy-event", async (event) => {
      console.log(
        "Received copy event",
        JSON.stringify({
          id: id,
          text: event.payload,
        })
      );
      const response = await fetch(
        "https://one-clipboard-server.vercel.app/api/copy-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            text: event.payload,
          }),
        }
      );

      if (response.ok) {
        console.log("Copied to server");
      } else {
        console.log("Failed to copy to server");
      }
    });

    listen("paste-event", async (event) => {
      console.log("Received paste event");
      const response = await fetch(
        "https://one-clipboard-server.vercel.app/api/paste-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Pasted from server", data.text);
        setText(data.text);
        emit("paste-response", data.text);
      } else {
        console.log("Failed to paste from server");
      }
    });
  });
  return (
    <div>
      <h1>Home</h1>
      <button
        onClick={async () => {
          await storeId("");
          window.location.href = "/";
        }}
      >
        Reset ID
      </button>
      <p>{text}</p>
    </div>
  );
}
