import {
  writeFile,
  readTextFile,
  BaseDirectory,
  createDir,
  exists,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { createDataFolder } from "./commonFileManager";


const storeHistory = async (data) => {
  const str = data.join(",");
  try {
    await writeTextFile(
      {
        contents: str,
        path: `clipo/history.clipo`,
      },
      {
        dir: BaseDirectory.Document,
      }
    );
  } catch (error) {
    console.error("Failed to write file", error);
  }
};

const getHistory = async () => {
  console.log("Getting History");

  //   const doesExist = await exists(`clipo/history.clipo`, {
  //     dir: BaseDirectory.Document,
  //   });
  const doesExist = true;
  console.log(doesExist);
  if (doesExist) {
    console.log("File exists");
    try {
      const data = await readTextFile("clipo/history.clipo", {
        dir: BaseDirectory.Document,
      });
      console.log("data: ", data);
      const result = data.split(",").filter((item) => item !== "");

      return result;
    } catch (error) {
      console.error("Failed to read file", error);
    }
  } else {
    console.log("File does not exist");
    await createDataFolder();
    await storeHistory([]);
  }
  return [];
};

export { storeHistory, getHistory };
