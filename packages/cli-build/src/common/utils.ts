import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export async function getFilePathByExts(exts: string | string[], dirname: string, filename: string) {
  const fileExts = Array.isArray(exts) ? exts : [exts];
  const filePaths = fileExts.map(ext => path.resolve(dirname, `${filename}.${ext}`));
  for (const filePath of filePaths) {
    const exists = await promisify(fs.exists)(filePath);
    if (exists) {
      return filePath;
    }
  }
}

export function oneOfExts(exts: string | string[], filePath: string) {
  if (!filePath) {
    return false;
  }
  const fileExts = Array.isArray(exts) ? exts : [exts];
  return fileExts.includes(path.extname(filePath));
}

export function removeExt(filePath: string) {
  const extname = path.extname(filePath);
  const extLen = extname.length;
  return filePath.substr(0, filePath.length - extLen);
}

export function startsWith(filename: string, exts: string | string[]): boolean {
  const arr = Array.isArray(exts) ? exts : [exts];
  for (const ext of arr) {
    if (filename.startsWith(ext)) {
      return true;
    }
  }
  return false;
}
