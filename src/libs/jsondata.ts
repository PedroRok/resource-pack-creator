// packdata.ts
import exp from "constants";
import { FileData } from "./packdata";
import { json } from "stream/consumers";
import path from "path";

export type SimpleModelData = {
  parent?: RelateData;
  textures?: { [key: string]: RelateData };
  overrides?: { predicate: Predicate; model: RelateData }[];
};

type RelateData = {
  // example:
  source: string; // "minecraft:"
  path: string; // "block/cube_all"
};

type Predicate = {
  [key: string]: string | number; // example: { "custom_model_data": 1 }
};

export async function validateJson(fileData: FileData): Promise<boolean> {
  console.log(`Verifying if file is valid: ${fileData.fullPath.split("\\").pop()}`);
  const jsonData = fileData.jsonData;
  if (!jsonData) {
    console.error("JSON data not found.");
    return false;
  }
  var pathToSearch: {key: string, path:string}[] = [];
  if (jsonData.textures) {
    var i = 0;
    Object.keys(jsonData.textures).forEach((dt: string) => {
      pathToSearch[i] = { key: dt, path: getPath(fileData, jsonData.textures[dt], "png", "textures") };
      i++;
    });
  }

  if (jsonData.parent) {
    pathToSearch[pathToSearch.length] = { key: "parent", path: getPath(fileData, jsonData.parent, "json", "models") };
  }
  
  for (const path of pathToSearch) {
    validatePath(path.path).then((response) => {
      if (!response.found) {
        console.error(`File not found: ${path.path.split("\\").pop()}`);
        return false;
      }
      console.log(`File found: ${path.path.split("\\").pop()}`);
    });
  }
  return true;
}

function getPath(fileData: FileData, filePath: string, fileType: "png" | "json", fileDir: "textures" | "models" | "blockstates"): string {
  var origin = `assets\\minecraft\\${fileDir}\\`;
  var packSplit = filePath.split(":");
  var relativePath = filePath;
  if (packSplit.length > 1) {
    origin = `assets\\${packSplit[0]}\\${fileDir}\\`;
    relativePath = packSplit[1];
  }
  return `${fileData.fullPath.replace(fileData.relativePath, "") + (origin + relativePath).replace(/\//g, "\\")}.${fileType}`;
}

async function validatePath(pathToSearch: string): Promise<{ found: boolean; dataFile: FileData | undefined; }> {
  const response = await fetch(
    `/api/check-file?path=${encodeURIComponent(pathToSearch)}`
  );
  if (!response.ok) {
    console.error(response.statusText);
    return {found: false , dataFile: undefined};
  }
  const files: FileData = await response.json();
  return { found: true, dataFile: files };
}
