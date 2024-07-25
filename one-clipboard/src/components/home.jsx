import { emit, listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { storeId, getId } from "../utils/IdManager";
import { AnimatedList } from 'react-animated-list'; 

export default function Home() {
  const [id, setId] = useState("");
  const [text, setText] = useState("");
  const [pasteHistory, setPasteHistory] = useState([]);
  let lastEventTime = Date.now();
  let last = "";
  useEffect(() => {
    const fetchData = async () => {
      const id = await getId();
      setId(id);
    };
    fetchData();
  }, []);



  useEffect(() => {
    listen("paste-event", async (event) => {
      console.log("Pasted from server", event.payload.text);
      const now = Date.now();
      if (now - lastEventTime < 2000) {
        lastEventTime = Date.now();
        return;
      }
      const text = event.payload.text;
      if (text === last) return;
      if (pasteHistory.includes(text)) return;
      // console.log("Pasted from server", text);
      lastEventTime = Date.now();
      last = text;
      console.log(pasteHistory)
      setPasteHistory((prev) => [...prev, text]);
    });
    return () => {
      
    }
  }, []);

  useEffect(() => {
    const temp = pasteHistory;
    for (let i = 1; i < pasteHistory.length; i++) {
      if (temp[i] === temp[i - 1]) {
        temp.splice(i, 1);
        i--;
      }
    }
    setPasteHistory(temp);
  }, [pasteHistory]);
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
      {/* <p>{text}</p> */}
      <AnimatedList>
        {pasteHistory.map((item, index) => (
          <div key={index}>
            <p>{item}</p>
          </div>
        ))}
      </AnimatedList>
    </div>
  );
}
