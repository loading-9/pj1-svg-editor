import { readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { SvgStore } from '../application/SvgStore.js';
import { SvgCodec } from './SvgCodec.js';

export class FileSvgStore implements SvgStore {
  constructor(private readonly codec = new SvgCodec()) {}
  read(path: string): { document: SvgDocument; warnings: readonly string[] } {
    let source: string;
    try { source = readFileSync(path, 'utf8'); }
    catch { throw new Error(`cannot read file: ${path}`); }
    return this.codec.decode(source);
  }
  write(path: string, document: SvgDocument): void {
    const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
    try {
      writeFileSync(temporary, this.codec.encode(document), { encoding: 'utf8', flag: 'wx' });
      renameSync(temporary, path);
    } catch {
      try { unlinkSync(temporary); } catch { /* The temporary file may not exist. */ }
      throw new Error(`cannot write file: ${path}`);
    }
  }
}
