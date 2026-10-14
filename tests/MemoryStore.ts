import type { SvgStore } from '../src/application/SvgStore.js';
import { SvgDocument } from '../src/domain/SvgDocument.js';

export class MemoryStore implements SvgStore {
  private saved = new SvgDocument();
  fail = false;
  read(): { document: SvgDocument; warnings: string[] } {
    if (this.fail) throw new Error('cannot read file: fail.svg');
    return { document: this.saved.clone(), warnings: [] };
  }
  write(_path: string, document: SvgDocument): void {
    if (this.fail) throw new Error('cannot write file: fail.svg');
    this.saved = document.clone();
  }
}
