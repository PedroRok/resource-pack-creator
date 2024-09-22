import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export type FileData = {
  name: string;
  isDirectory: boolean;
  fullPath: string;
  relativePath: string | undefined;
  children?: FileData[];
  jsonData?: any;
  imageData?: string;
};

function listDirectoryTree(directoryPath: string): FileData[] {
  function traverse(dir: string): FileData {
    const stats = fs.statSync(dir);
    const fileData: FileData = {
      name: path.basename(dir),
      isDirectory: stats.isDirectory(),
      fullPath: dir,
      relativePath: path.relative(directoryPath, dir),
      children: [],
      jsonData: dir.endsWith(".json") || dir.endsWith(".mcmeta") ? JSON.parse(fs.readFileSync(dir, 'utf-8')) : undefined,
      imageData: dir.endsWith(".png") ? fs.readFileSync(dir).toString('base64') : undefined,
    };

    if (fileData.isDirectory) {
      fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        fileData.children!.push(traverse(fullPath));
      });
    }

    return fileData;
  }

  return [traverse(directoryPath)];
}

function removeCircularReferences(obj: any, seen: Set<any> = new Set()): any {
  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) {
      return;
    }
    seen.add(obj);
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = removeCircularReferences(obj[key], seen);
      }
    }
    seen.delete(obj);
  }
  return obj;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const directoryPath = req.query.path as string;
  try {
    const files = listDirectoryTree(directoryPath);
    const sanitizedFiles = removeCircularReferences(files);
    console.log(`Successfully listed directory: ${directoryPath}`);
    res.status(200).json(sanitizedFiles);
  } catch (error) {
    console.error(`Failed to read directory: ${directoryPath}`, error);
    res.status(500).json({ error: 'Failed to read directory' });
  }
}