import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { FileData } from './list-directory';

function getFile(directoryPath: string): FileData {
    function traverse(dir: string): FileData {
      const stats = fs.statSync(dir);
      const fileData: FileData = {
        name: path.basename(dir),
        isDirectory: stats.isDirectory(),
        fullPath: dir,
        relativePath: undefined,
        children: [],
        jsonData: dir.endsWith(".json") ? JSON.parse(fs.readFileSync(dir, 'utf-8')) : undefined,
        imageData: dir.endsWith(".png") ? fs.readFileSync(dir).toString('base64') : undefined,
      };
  
      return fileData;
    }
  
    return traverse(directoryPath);
  }
  
  
  export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const directoryPath = req.query.path as string;
    try {
      const files = getFile(directoryPath);
      res.status(200).json(files);
    } catch (error) {
      console.error(`Couldn't find file: ${directoryPath.split('/').pop()}`);
      res.status(404).json({ error: 'Couldn\'t find file' });
    }
  }