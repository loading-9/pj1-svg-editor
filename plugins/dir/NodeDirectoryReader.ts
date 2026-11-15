import { readdirSync } from 'node:fs';
import type { DirectoryEntry, DirectoryReader } from './DirectoryReader.js';
/** Adapter: Node Dirent/process APIs -> the command's directory port. */
export class NodeDirectoryReader implements DirectoryReader {
  currentDirectory(): string { return process.cwd(); }
  entries(path: string): readonly DirectoryEntry[] {
    return readdirSync(path,{withFileTypes:true}).map(entry=>({name:entry.name,kind:entry.isDirectory()?'directory':entry.isFile()?'file':entry.isSymbolicLink()?'link':'other'}));
  }
}
