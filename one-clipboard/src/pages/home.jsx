import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { storeId, getId } from "../utils/IdManager";
import { motion } from "framer-motion";
import Notification from "../components/notification";
import shortener from "../utils/shortener";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faImagePortrait,
} from "@fortawesome/free-solid-svg-icons";
import { storeHistory, getHistory } from "../utils/historyManager";
import GitHubLink from "../components/githublink";

export default function Home() {
  const [id, setId] = useState("123");
  const [pasteHistory, setPasteHistory] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [getIdButton, setGetIdButton] = useState("");
  let lastEventTime = Date.now();
  let last = "";
  useEffect(() => {
    const fetchData = async () => {
      const id = await getId();
      if (id === "") {
        window.location.href = "/";
      }
      setId(id);
    };
    const fetchHistory = async () => {
      console.log("Fetching History");
      const history = await getHistory();
      console.log("History", history);
      console.log(history);
      if (history) {
        setPasteHistory(history);
      }
    };
    fetchHistory();
    fetchData();
  }, []);

  useEffect(() => {
    const unlisten =listen("paste-event", async (event) => {
      console.log("Pasted from server", event.payload.text);
      const now = Date.now();
      if (now - lastEventTime < 2000) {
        lastEventTime = Date.now();
        return;
      }
      const text = event.payload.text;
      if (text === last) return;
      if (pasteHistory.includes(text)) return;

      lastEventTime = Date.now();
      last = text;
      console.log(pasteHistory);
      setPasteHistory((prev) => [text, ...prev]);
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    }
  }, [isVisible]);

  useEffect(() => {
    if (getIdButton) {
      setTimeout(() => {
        setGetIdButton(false);
      }, 1500);
    }
  }, [getIdButton]);

  // useEffect(() => {
  //   const temp = pasteHistory;
  //   for (let i = 1; i < pasteHistory.length; i++) {
  //     if (temp[i] === temp[i - 1]) {
  //       temp.splice(i, 1);
  //       i--;
  //     }
  //   }
  //   storeHistory(pasteHistory);
  //   setPasteHistory(temp);
  // }, [pasteHistory]);
  useEffect(() => {
    storeHistory(pasteHistory);
  }, [pasteHistory]);

  return (
    <div className="flex flex-col text-center select-none bg-[#101010] h-full min-h-screen text-[rgba(255,255,255,0.5)] overflow-x-hidden">
      <div className="flex justify-between p-4 mb-40">
        <h1 className="font-mono text-4xl">clipo</h1>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            className="border-0 rounded-md p-2 border-[rgba(255,255,255,0.3)]"
            onClick={async () => {
              await storeId("");
              window.location.href = "/";
            }}
          >
            <FontAwesomeIcon icon={faDeleteLeft} className="text-2xl" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            className="border-0 rounded-md p-2 border-[rgba(255,255,255,0.3)]"
            onClick={async () => {
              navigator.clipboard.writeText(id);
              setGetIdButton(true);
              
            }}
          >
            <FontAwesomeIcon icon={faImagePortrait} className="text-2xl" />
          </motion.button>
        </div>
      </div>
      <div
        transition={{
          opacity: { duration: 1, ease: "linear" },
          layout: { duration: 0.3, ease: "easeInOut", bounce: 0.5 },
        }}
        className="flex flex-col items-center h-3/4 justify-center mb-20 overflow-x-hidden"
      >
        <>
          {pasteHistory.length === 0 && (
            <div>
              <h1 className="text-2xl text-[rgba(255,255,255,0.2)]">
                No History
              </h1>
            </div>
          )}
          {pasteHistory.map((item, index) => (
            <motion.div
              whileTap={{ scale: 0.95 }}
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              whileHover={{
                background: "rgba(255,255,255,0.1)",
                fontSize: "24px",
                transition: { duration: 0.1 },
              }}
              onClick={() => {
                navigator.clipboard.writeText(item);
                if (isVisible) {
                  setIsVisible(false);
                  setIsVisible(true);
                }
                setIsVisible(true);
              }}
              className="border-2 text-center border-[rgba(255,255,255,0.3)] rounded-xl bg-[rgba(255,255,255,0.02)] w-3/4 p-4  mt-4 text-xl max-w-[600px] shadow-sm"
            >
              {shortener(item)}
            </motion.div>
          ))}
        </>
      </div>
      <Notification isVisible={isVisible} text={"Copied to Clipboard"} />
      <Notification isVisible={getIdButton} id={`Copied to Clipboard: ${id}`} />
      <GitHubLink />
    </div>
  );
}
