"use client";

import { useState } from "react";


import McButton from "./Buttons";
import { FileData } from "@/libs/packdata"; // Importar o tipo, sem a lógica do FS no frontend

export default function FileSelector(props: { setSelected: (files: FileData[]) => void; selectedFiles: FileData[]; jsonFile: (path: string) => void }) {
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [showPack, setShowPack] = useState<boolean>(true);

  const handleFileChange = async () => {
    try {
      // Abre o diálogo de seleção de diretório usando Electron
      const selectedPaths = await window.electron.showOpenDialog({ properties: ["openDirectory"] });
      if (selectedPaths.length === 0) {
        return; // Usuário cancelou a seleção
      }

      const selectedPath = selectedPaths[0];
      const response = await fetch(`/api/list-directory?path=${encodeURIComponent(selectedPath)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch directory tree: ${response.statusText}`);
      }
      const files: FileData[] = await response.json();
      props.setSelected(files);

      const packJson = findPackJson(files);
      if (packJson) {
        setShowPack(true);
      } else {
        setShowPack(false);
      }
    } catch (error) {
      console.error("Failed to fetch directory tree:", error);
      setShowPack(false);
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

  const renderFileTree = (files: FileData[], path: string = "") => {
    return (
      <ul>
        {files.map((file) => {
          const fullPath = `${path}/${file.name}`;
          return (
            <li key={fullPath}>
              {file.isDirectory ? (
                <>
                  <span onClick={() => toggleFolder(fullPath)} className="cursor-pointer whitespace-nowrap">
                    {expandedFolders[fullPath] ? "📂" : "📁"} {file.name}
                  </span>
                  {expandedFolders[fullPath] && file.children && (
                    <div style={{ marginLeft: 20 }}>{renderFileTree(file.children, fullPath)}</div>
                  )}
                </>
              ) : (
                file.name.endsWith(".json") ? (
                  <span onClick={() => props.jsonFile(file.fullPath)} className="whitespace-nowrap hover:p-2">
                    📝 {file.name}
                  </span>
                ) : (
                  <span className="whitespace-nowrap">
                    {file.name.endsWith(".png") ? "🖼️" : file.name.endsWith(".mcmeta") ? "⛏️" : "📄"} {file.name}
                  </span>
                )
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
        <McButton onClick={handleFileChange}>Selecionar</McButton>
      ) : (
        renderFileTree(props.selectedFiles)
      )}
      {!showPack && (
        <div>
          <p className="text-red-400">Arquivo 'pack.json' não encontrado ou inválido.</p>
        </div>
      )}
    </div>
  );
}