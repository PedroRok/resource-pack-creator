// packdata.ts
import fs, { Stats } from 'fs';

export type FileData = {
  name: string;
  isDirectory: boolean;
  fullPath: string;
  relativePath: string;
  stats: Stats;
  children?: FileData[];
};

export type PackFileData = {
  packFormat: number;
  description: string;
};

export class PackData {
  private static readonly PACK_JSON_FILENAME = "pack.mcmeta";

  static async validatePackJson(files: FileData[]): Promise<PackFileData | undefined> {
    const packJsonFile = this.findPackJson(files);

    if (packJsonFile) {
      console.log(`'${this.PACK_JSON_FILENAME}' encontrado!`);
      return this.validatePackJsonContent(packJsonFile.fullPath);
    } else {
      console.log(`'${this.PACK_JSON_FILENAME}' não encontrado.`);
      return undefined;
    }
  }

  private static findPackJson(files: FileData[]): FileData | undefined {
    for (const file of files) {
      if (file.isDirectory && file.children) {
        const found = this.findPackJson(file.children);
        if (found) {
          return found;
        }
      } else if (file.name === this.PACK_JSON_FILENAME) {
        return file.stats.isFile() ? file : undefined;
      }
    }
    return undefined;
  }

  private static async validatePackJsonContent(filePath: string): Promise<PackFileData | undefined> {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const json = JSON.parse(fileContent);
    if (json.pack && json.pack.pack_format && json.pack.description) {
      const packFormat = json.pack.pack_format;
      const description = json.pack.description[0].text;
      console.log(`Conteúdo válido: pack_format = ${packFormat}, description = ${description}`);
      return { packFormat, description };
    }
    return undefined;
  }
}
