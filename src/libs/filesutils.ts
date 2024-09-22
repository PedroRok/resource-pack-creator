
import { FileData } from '@/libs/packdata';

export function getImage(file: FileData): string {
    // Verifica se o tipo de arquivo é uma imagem
    if (!file.imageData) {
      throw new Error('O arquivo não contém dados de imagem');
    }
  
    // Cria uma URL de dados (data URL) para a imagem
    const dataUrl = `data:image/png;base64,${file.imageData}`;
    return dataUrl;
  }


export function getFileWithName(files: FileData[], name: string): FileData | undefined {
    for (const file of files) {
      if (file.name === name) {
        return file;
      }
      if (file.isDirectory && file.children) {
        const found = getFileWithName(file.children, name);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }