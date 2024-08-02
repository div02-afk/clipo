import React, { useEffect, useRef } from "react";
import { storeId, getId } from "../utils/IdManager";
import { motion } from "framer-motion";
import { Suspense } from "react";

import Loader from "../components/loader";
export default function Login() {
  const [showLoader, setShowLoader] = React.useState(true);
  useEffect(() => {
    const check = async () => {
      const id = await getId();
      if (id != "" && id) {
        window.location.href = "/home";
        console.log("Already logged in");
      } else {
        setShowLoader(false);
      }
    };
    check();
  }, []);

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

  if (showLoader) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="flex flex-col text-center select-none  bg-[#101010] h-full min-h-screen text-[rgba(255,255,255,0.5)] overflow-x-hidden">
        <h1 className="text-4xl text-center p-4 mt-20">Get Started</h1>

        <input
          ref={inputRef}
          type="text"
          placeholder="Enter ID"
          className="rounded-2xl p-2  mt-40 bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.07)] w-1/2 lg:w-2/5 mx-auto mb-4"
        ></input>
        <div className=" flex gap-4 justify-center p-4 mt-20 flex-col align-middle items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{
              scale: 1.1,
              // background: "rgba(0,0,255,0.4)",
              transition: { duration: 0.2 },
              color: "white",
              border: "1px solid white",
            }}
            className="border-2 rounded-xl p-2 border-[rgba(255,255,255,0.3)] w-1/2 lg:w-1/4"
            onClick={() => {
              submit();
            }}
          >
            Join Sync
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{
              scale: 1.1,
              // background: "rgba(255,0,0,0.4)",
              transition: { duration: 0.2 },
              color: "white",
              border: "1px solid white",
            }}
            className="border-2 rounded-xl p-2 border-[rgba(255,255,255,0.3)]  w-1/2 lg:w-1/4"
            onClick={() => {
              setShowLoader(true);
              create();
            }}
          >
            Create ID
          </motion.button>
        </div>
      </div>
    </Suspense>
  );
}
