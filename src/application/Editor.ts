import { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
import type { EditCommand } from './EditCommand.js';
import { History } from './History.js';
import type { SvgStore } from './SvgStore.js';

export class Editor {
  private current: SvgDocument | undefined;
  private readPath: string | undefined;
  private savedPath: string | undefined;
  private readonly history = new History();
  constructor(private readonly store: SvgStore) {}
  get document(): SvgDocument {
    if (!this.current) throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  init(width: number, height: number): string {
    const document = new SvgDocument(width, height);
    this.current = document;
    this.readPath = undefined;
    this.savedPath = undefined;
    this.history.afterIo();
    return `canvas ${width}x${height} created`;
  }
  read(path: string): readonly string[] {
    const { document, warnings } = this.store.read(path);
    this.current = document; this.readPath = path; this.savedPath = undefined; this.history.afterIo();
    return [...warnings, `read ${path} (${document.count} elements)`];
  }
  save(path?: string): string {
    const document = this.document;
    const target = path ?? this.readPath ?? this.savedPath;
    if (!target) throw new Error('no file path. use save <file.svg>');
    this.store.write(target, document);
    this.savedPath = target;
    this.history.afterIo();
    return `saved to ${target} (${document.count} elements)`;
  }
  canvas(width?: number, height?: number): string {
    const document = this.document;
    if (width === undefined || height === undefined) return `canvas ${document.width}x${document.height}`;
    document.resize(width, height);
    this.history.afterIo();
    return `canvas resized to ${width}x${height}`;
  }
  edit(command: EditCommand, args: Arguments): string {
    const result = this.history.execute(command, this.document, args);
    this.current = result.document;
    return result.message;
  }
  undo(): string {
    void this.document;
    const result = this.history.undo(); this.current = result.document; return result.message;
  }
  redo(): string {
    void this.document;
    const result = this.history.redo(); this.current = result.document; return result.message;
  }
}
