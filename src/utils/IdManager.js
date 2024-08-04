import { invoke } from "@tauri-apps/api/tauri";
import { doesItExist, createDataFolder } from "./commonFileManager";

const storeId = async (id) => {
  try {
    await invoke("store_id", { id });
    console.log("Stored ID:", id);
  } catch (error) {
    console.error("Error storing ID:", error);
  }
};

// Function to retrieve ID
const getId = async () => {
  const doesExist = await doesItExist("clipo");
  if (!doesExist) {
    await createDataFolder();
  }
  try {
    const id = await invoke("get_id");
    console.log("Retrieved ID:", id);
    return id;
  } catch (error) {
    console.error("Error retrieving ID:", error);
  }
};

export { storeId, getId };
