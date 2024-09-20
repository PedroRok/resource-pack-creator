"use client";

import McButton from "@/components/Buttons";
import FileSelector from "@/components/FileSelector";
import { FileData } from "@/libs/packdata";
import { useState } from "react";

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-zinc-800 flex items-center justify-center max-h-[5vh]">
        <h1 className="text-white text-xl">Top Panel</h1>
      </header>
      <div className="flex flex-1 h-auto overflow-ellipsis max-h-[90vh]">
        <aside className="max-w-96 min-w-52 p-4 flex-2  resize-x">
          <div className="flex flex-col h-full ">
            <div className="overflow-y-auto">
              <FileSelector
                selectedFiles={selectedFiles}
                setSelected={(files: FileData[]) => setSelectedFiles(files)}
                jsonFile={(path: string) => console.log(path)}
              />
            </div>
            <div className="flex-grow"></div>
            {selectedFiles.length != 0 ? <McButton onClick={() => setSelectedFiles([])}>Close</McButton> : null}
          </div>
        </aside>
        <main className="flex-1 bg-gray-800 p-8 border-black border-y-4 rounded-3xl">
          <h2 className="text-lg font-semibold">Central panel</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid
            consequatur suscipit molestias nobis, necessitatibus dolorum, vitae
            ab ad numquam porro tempore in eius, aperiam illum officiis ullam.
            Blanditiis, iusto nihil.
          </p>
        </main>
      </div>
      <footer className="h-16 bg-gray-800 flex items-center justify-center max-h-[5vh] overflow-hidden"></footer>
    </div>
  );
}
