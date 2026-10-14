import type { Editor } from './Editor.js';

export abstract class Command {
  get exits(): boolean { return false; }
  abstract get syntax(): string;
  abstract run(editor: Editor, values: readonly string[]): readonly string[];
}
