import { motion } from "framer-motion";

export default function Notification({ isVisible, text,id, textColor }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileHover={id&&{  opacity: 1, y: 0 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { y: 20, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className=" select-none absolute bottom-10 flex w-full items-center justify-center text-center font-mono"
      >
        <div
          className={`rounded-xl border-2 border-[#232527] bg-[#121314a8] p-2 px-4 backdrop-filter backdrop-blur-sm`}
          style={{ color: textColor }}
        >
          <div>{text || id}</div>
        </div>
      </motion.div>
    </>
  );
}
