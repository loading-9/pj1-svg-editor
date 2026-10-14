import type { SvgDocument } from '../domain/SvgDocument.js';

export interface SvgStore {
  read(path: string): { document: SvgDocument; warnings: readonly string[] };
  write(path: string, document: SvgDocument): void;
}
