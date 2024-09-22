"use client";

import { useState } from "react";
import McButton from "./Buttons";
import { FileData } from "@/libs/packdata"; // Importar o tipo, sem a lógica do FS no frontend
import { getVersion } from "@/libs/packversions";

export default function FileSelector(props: {
  setSelected: (files: FileData[]) => void;
  selectedFiles: FileData[];
  jsonFile: (file: FileData) => void;
}) {
  const [expandedFolders, setExpandedFolders] = useState<{[key: string]: boolean;}>({});
  const [showPack, setShowPack] = useState<FileData | undefined>(undefined);
  const [selectedPath, setSelectedPath] = useState<string | undefined>(undefined);

  const handleFileChange = async () => {
    try {
      // Abre o diálogo de seleção de diretório usando Electron
      const selectedPaths = await window.electron.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (selectedPaths.length === 0) {
        return; // Usuário cancelou a seleção
      }

      const selectedPath = selectedPaths[0];
      setSelectedPath(selectedPath);
      fetchDirectoryTree(selectedPath);
    } catch (error) {
      console.error("Failed to fetch directory tree:", error);
      setShowPack(undefined);
    }
  };

  const fetchDirectoryTree = async (path: string) => {
    const response = await fetch(
      `/api/list-directory?path=${encodeURIComponent(path)}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch directory tree: ${response.statusText}`
      );
    }
    const files: FileData[] = await response.json();
    props.setSelected(files);

    const packJson = findPackJson(files);
    if (packJson) {
      setShowPack(packJson);
    } else {
      setShowPack(undefined);
    }
  };

  const findPackJson = (files: FileData[]): FileData | undefined => {
    for (const file of files) {
      if (file.isDirectory && file.children) {
        const found = findPackJson(file.children);
        if (found) {
          return found;
        }
      } else if (file.name === "pack.mcmeta") {
        return file;
      }
    }
    return undefined;
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prevState) => ({
      ...prevState,
      [folderName]: !prevState[folderName],
    }));
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>, toPath: string) => {
    event.preventDefault();

    const files: File[] = [];
    const fileDatas: FileData[] = [];
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const file = event.dataTransfer.files.item(i);
      if (file) {
        files.push(file);
      }
    }
    window.electron.saveFile(files, toPath);
    fetchDirectoryTree(selectedPath!);
  };

  const renderFileTree = (files: FileData[], path: string = "") => {
    return (
      <ul>
        {files.map((file) => {
          const fullPath = `${path}/${file.name}`;
          return (
            <li key={fullPath}>
              {file.isDirectory ? (
                <>
                  <div
                    onClick={() => toggleFolder(fullPath)}
                    onDrop={(e) => onDrop(e, file.fullPath)} 
                    onDragOver={(e) => e.preventDefault()}
                    className="cursor-pointer whitespace-nowrap"
                  >
                    {expandedFolders[fullPath] ? "📂" : "📁"}{file.name}
                  </div>
                  {expandedFolders[fullPath] && file.children && (
                    <div style={{ marginLeft: 20 }}>
                      {renderFileTree(file.children, fullPath)}
                    </div>
                  )}
                </>
              ) : file.name.endsWith(".json") ? (
                <span
                  onClick={() => props.jsonFile(file)}
                  className="whitespace-nowrap hover:p-2"
                >
                  📝 {file.name}
                </span>
              ) : (
                <span className="whitespace-nowrap">
                  {file.name.endsWith(".png")
                    ? "🖼️"
                    : file.name.endsWith(".mcmeta")
                    ? "⛏️"
                    : "📄"}{" "}
                  {file.name}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div>
      {props.selectedFiles.length === 0 ? (
        <McButton className="w-full" onClick={handleFileChange}>Select Folder</McButton>
      ) : showPack ? (
        <div>
          <p className="border-b-2 mb-2">⭐Pack Version: {getVersion(showPack?.jsonData.pack.pack_format)}</p>
          {renderFileTree(props.selectedFiles)}
        </div>
      ) : (
        <div>
          <p className="text-red-400">Couldn't find the 'pack.mcmeta' file</p>
        </div>
      )}
    </div>
  );
}