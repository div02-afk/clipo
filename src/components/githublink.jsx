import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";

export default function GitHubLink() {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{
        scale: 1.2,
        color: "#f1f1f1",
        transition: { duration: 0.1 },
      }}
      className="fixed bottom-5 left-6"
      onClick={async () => {
        const url = "https://github.com/div02-afk/one-clipboard-tauri";
        await invoke("open_in_browser", { url });
      }}
    >
      <FontAwesomeIcon icon={faGithub} size="2x" />
    </motion.div>
  );
}
