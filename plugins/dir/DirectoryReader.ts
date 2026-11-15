export interface DirectoryEntry { readonly name: string; readonly kind: 'directory' | 'file' | 'link' | 'other' }
export interface DirectoryReader {
  currentDirectory(): string;
  entries(path: string): readonly DirectoryEntry[];
}
