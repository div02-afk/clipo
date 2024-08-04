import { exists, BaseDirectory ,createDir} from "@tauri-apps/api/fs";

const doesItExist = async (path) => {
  const doesExist = await exists(path, { dir: BaseDirectory.Document });
  return doesExist;
};
const createDataFolder = async () => {
    try {
      await createDir("clipo", {
        dir: BaseDirectory.Document,
        recursive: true,
      });
      console.log("Directory created or already exists");
    } catch (e) {
      console.error("Failed to create directory", e);
    }
  };
export {doesItExist,createDataFolder}
