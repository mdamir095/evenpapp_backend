import * as fs from 'fs';
import * as path from 'path';

// Define a base structure for files
interface IFileData {
  name: string; // File name without extension
  content: string; // File content as string
}

/**
 * Reads all files recursively from a directory and returns an array of a generic type.
 * @param dirPath - Directory path to scan
 * @param mapFn - Optional mapper function to transform file data
 * @returns Array of file data objects
 */
export function readFilesRecursively<T extends IFileData>(
  dirPath: string,
  mapFn?: (file: IFileData) => T,
): T[] {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  const result: IFileData[] = [];

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      result.push(...readFilesRecursively(fullPath)); // Recursively read child directories
    } else if (file.isFile() && file.name.endsWith('.hbs')) {
      const name = file.name.split('.')[0]; // File name without extension
      const content = fs.readFileSync(fullPath, 'utf8');
      result.push({ name, content });
    }
  });

  // Apply the mapper function if provided
  return mapFn ? result.map(mapFn) : (result as T[]);
}
